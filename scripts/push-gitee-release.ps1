# 将 MSIX 同步到 Gitee 国内镜像仓库（git 推送到 master/releases/，不使用 Release API）
# 用法:
#   $env:GITEE_TOKEN = "<token>"
#   .\scripts\push-gitee-release.ps1 -Version 0.1.8 -MsixPath dist\PetitPlanetWiki_0.1.8.0_x64.msix

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [Parameter(Mandatory = $true)]
    [string]$MsixPath,

    [string]$GiteeOwner = "kqx123",
    [string]$GiteeRepo = "petit-planet-wiki",
    [string]$Branch = "master"
)

$ErrorActionPreference = "Stop"

$token = ($env:GITEE_TOKEN ?? "").Trim()
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "未设置 GITEE_TOKEN，请在 GitHub Environment「CERTIFICATE」中配置 Gitee 私人令牌。"
}

if (-not (Test-Path -LiteralPath $MsixPath)) {
    throw "MSIX 文件不存在: $MsixPath"
}

$tag = if ($Version -match '^v') { $Version } else { "v$Version" }
$repoPath = "$GiteeOwner/$GiteeRepo"
$msixName = Split-Path -Leaf $MsixPath
$msixSize = (Get-Item -LiteralPath $MsixPath).Length
$downloadUrl = "https://gitee.com/$repoPath/raw/$Branch/releases/$msixName"

Write-Host ">>> 同步到 Gitee 主分支: $repoPath ($Branch/releases/, $tag)" -ForegroundColor Cyan

$workRoot = if ($env:RUNNER_TEMP) { $env:RUNNER_TEMP } else { $env:TEMP }
$workDir = Join-Path $workRoot "gitee-mirror-$([Guid]::NewGuid().ToString('N'))"
$encodedToken = [Uri]::EscapeDataString($token)
$cloneUrl = "https://oauth2:${encodedToken}@gitee.com/${repoPath}.git"

try {
    if (Test-Path -LiteralPath $workDir) {
        Remove-Item -LiteralPath $workDir -Recurse -Force
    }

    Write-Host ">>> 克隆 Gitee 仓库 ($Branch)..." -ForegroundColor Gray
    & git clone --depth 1 --branch $Branch $cloneUrl $workDir
    if ($LASTEXITCODE -ne 0) {
        throw "克隆 Gitee 仓库失败，请确认令牌具备 projects 权限且分支 $Branch 存在。"
    }

    $releasesDir = Join-Path $workDir "releases"
    New-Item -ItemType Directory -Path $releasesDir -Force | Out-Null

    Copy-Item -LiteralPath $MsixPath -Destination (Join-Path $releasesDir $msixName) -Force
    Write-Host ">>> 已复制: releases/$msixName ($([math]::Round($msixSize / 1MB, 2)) MB)" -ForegroundColor Gray

    $latestObj = [ordered]@{
        tag_name     = $tag
        filename     = $msixName
        size         = $msixSize
        download_url = $downloadUrl
        source       = "gitee"
        branch       = $Branch
        updated_at   = (Get-Date).ToString("o")
    }
    $latestJson = ($latestObj | ConvertTo-Json -Compress)
    $latestPath = Join-Path $releasesDir "latest.json"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($latestPath, $latestJson, $utf8NoBom)
    Write-Host ">>> 已更新: releases/latest.json" -ForegroundColor Gray

    Push-Location $workDir
    & git config user.email "ci@petitplanet.wiki"
    & git config user.name "PetitPlanetWiki CI"
    & git add "releases/"

    $pending = & git status --porcelain "releases/"
    if ([string]::IsNullOrWhiteSpace($pending)) {
        Write-Host ">>> releases/ 无变更，跳过推送" -ForegroundColor Yellow
    }
    else {
        $commitMsg = "同步 MSIX 镜像: $tag"
        & git commit -m $commitMsg
        if ($LASTEXITCODE -ne 0) {
            throw "git commit 失败"
        }
        Write-Host ">>> 推送到 Gitee $Branch ..." -ForegroundColor Cyan
        & git push origin $Branch
        if ($LASTEXITCODE -ne 0) {
            throw "git push 失败，请确认令牌对仓库有写入权限。"
        }
        Write-Host ">>> Gitee 主分支同步完成" -ForegroundColor Green
    }
    Pop-Location
}
finally {
    if (Test-Path -LiteralPath $workDir) {
        Remove-Item -LiteralPath $workDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "    下载地址: $downloadUrl" -ForegroundColor Gray
