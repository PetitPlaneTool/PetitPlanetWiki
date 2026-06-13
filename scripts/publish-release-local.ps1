# 本地签名构建并发布到 GitHub Releases（不依赖 CI/CD）
# 用法: .\scripts\publish-release-local.ps1 -Version 0.0.2
# 需要: MSBuild、Inno Setup（可选）、gh CLI 已登录

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [string]$Platform = "x64",

    [string]$PfxPath = "certificate\codesign.pfx",

    [string]$PfxPasswordFile = "certificate\codesign.pfx.password.txt",

    [string]$PfxBase64File = "certificate\codesign.pfx.base64.txt"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "未找到 gh CLI。请安装: https://cli.github.com/ 并执行 gh auth login"
}

# 还原 PFX（优先使用本地 pfx，否则从 base64 文件）
$pfxFull = Join-Path $Root $PfxPath
if (-not (Test-Path $pfxFull)) {
    $base64File = Join-Path $Root $PfxBase64File
    if (-not (Test-Path $base64File)) {
        throw "未找到 $PfxPath 或 $PfxBase64File"
    }
    $pfxFull = Join-Path $Root "codesign.pfx"
    $bytes = [Convert]::FromBase64String((Get-Content $base64File -Raw))
    [IO.File]::WriteAllBytes($pfxFull, $bytes)
}

$pwFile = Join-Path $Root $PfxPasswordFile
if (-not (Test-Path $pwFile)) {
    throw "未找到 PFX 密码文件: $PfxPasswordFile"
}

$env:CERTIFICATE_BASE64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($pfxFull))
$env:CERTIFICATE_PASSWORD = (Get-Content $pwFile -Raw).Trim()

& (Join-Path $PSScriptRoot "release-build.ps1") -Version $Version -Platform $Platform

$tag = "v$Version"
$distDir = Join-Path $Root "dist"

Write-Host ">>> 创建/更新 GitHub Release $tag ..." -ForegroundColor Cyan
gh release view $tag 2>$null
if ($LASTEXITCODE -eq 0) {
    gh release upload $tag "$distDir\*" --clobber
} else {
    gh release create $tag "$distDir\*" --title $tag --generate-notes
}

if (Test-Path (Join-Path $Root "codesign.pfx")) {
    Remove-Item (Join-Path $Root "codesign.pfx") -Force -ErrorAction SilentlyContinue
}

Write-Host ">>> 发布完成: https://github.com/PetitPlaneTool/PetitPlanetWiki/releases/tag/$tag" -ForegroundColor Green
