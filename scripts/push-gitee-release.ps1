# 将发布产物同步到 Gitee 国内镜像（git 推送到 master/releases/）
param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [string]$DistDir = "dist",

    [string]$GiteeOwner = "kqx123",
    [string]$GiteeRepo = "petit-planet-wiki",
    [string]$Branch = "master"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$distPath = if ([IO.Path]::IsPathRooted($DistDir)) { $DistDir } else { Join-Path $Root $DistDir }

$token = ($env:GITEE_TOKEN ?? "").Trim()
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "未设置 GITEE_TOKEN"
}

if (-not (Test-Path -LiteralPath $distPath)) {
    throw "产物目录不存在: $distPath"
}

$tag = if ($Version -match '^v') { $Version } else { "v$Version" }
$repoPath = "$GiteeOwner/$GiteeRepo"

$artifacts = Get-ChildItem -Path $distPath -File | Where-Object {
    $_.Name -like "PetitPlanetWiki*" -or $_.Name -eq "PetitPlanetWikiSetupFull.exe"
}
if (-not $artifacts) {
    throw "dist 中未找到可同步的发布文件"
}

$msix = $artifacts | Where-Object { $_.Extension -eq ".msix" } | Select-Object -First 1
if (-not $msix) { throw "dist 中未找到 MSIX" }

$fullSetup = $artifacts | Where-Object { $_.Name -eq "PetitPlanetWikiSetupFull.exe" } | Select-Object -First 1
$msixName = $msix.Name
$msixSize = $msix.Length
$downloadUrl = "https://gitee.com/$repoPath/raw/$Branch/releases/$msixName"
$fullSetupUrl = if ($fullSetup) {
    "https://gitee.com/$repoPath/raw/$Branch/releases/PetitPlanetWikiSetupFull.exe"
} else { $null }

Write-Host ">>> 同步到 Gitee: $repoPath ($Branch/releases/, $tag)" -ForegroundColor Cyan

$workRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { $env:TEMP }
$workDir = Join-Path $workRoot "gitee-mirror-$([Guid]::NewGuid().ToString('N'))"
$encodedToken = [Uri]::EscapeDataString($token)
$cloneUrl = "https://oauth2:${encodedToken}@gitee.com/${repoPath}.git"

try {
    if (Test-Path -LiteralPath $workDir) { Remove-Item -LiteralPath $workDir -Recurse -Force }

    & git clone --depth 1 --branch $Branch $cloneUrl $workDir
    if ($LASTEXITCODE -ne 0) { throw "克隆 Gitee 仓库失败" }

    $releasesDir = Join-Path $workDir "releases"
    New-Item -ItemType Directory -Path $releasesDir -Force | Out-Null

    foreach ($file in $artifacts) {
        Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $releasesDir $file.Name) -Force
        Write-Host ">>> 已复制: releases/$($file.Name)" -ForegroundColor Gray
    }

    $latestObj = [ordered]@{
        tag_name          = $tag
        filename          = $msixName
        size              = $msixSize
        download_url      = $downloadUrl
        full_setup_name   = "PetitPlanetWikiSetupFull.exe"
        full_setup_url    = $fullSetupUrl
        source            = "gitee"
        branch            = $Branch
        updated_at        = (Get-Date).ToString("o")
    }
    $latestJson = ($latestObj | ConvertTo-Json -Compress)
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText((Join-Path $releasesDir "latest.json"), $latestJson, $utf8NoBom)

    Push-Location $workDir
    & git config user.email "ci@petitplanet.wiki"
    & git config user.name "PetitPlanetWiki CI"
    & git add "releases/"

    $pending = & git status --porcelain "releases/"
    if ([string]::IsNullOrWhiteSpace($pending)) {
        Write-Host ">>> releases/ 无变更，跳过推送" -ForegroundColor Yellow
    }
    else {
        & git commit -m "同步发布镜像: $tag"
        if ($LASTEXITCODE -ne 0) { throw "git commit 失败" }
        & git push origin $Branch
        if ($LASTEXITCODE -ne 0) { throw "git push 失败" }
        Write-Host ">>> Gitee 同步完成" -ForegroundColor Green
    }
    Pop-Location
}
finally {
    if (Test-Path -LiteralPath $workDir) {
        Remove-Item -LiteralPath $workDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "    MSIX: $downloadUrl" -ForegroundColor Gray
if ($fullSetupUrl) { Write-Host "    离线包: $fullSetupUrl" -ForegroundColor Gray }
