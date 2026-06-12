# CI/CD 发布构建：MSIX（签名）+ Inno Setup 安装器
# 用法:
#   $env:CERTIFICATE_BASE64 = "<base64>"
#   $env:CERTIFICATE_PASSWORD = "<password>"
#   .\scripts\release-build.ps1 -Version 0.0.1

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [string]$Platform = "x64"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $Root "dist"
$appxVersion = if ($Version -match '^\d+\.\d+\.\d+$') { "$Version.0" } else { $Version }

New-Item -ItemType Directory -Path $distDir -Force | Out-Null

& (Join-Path $PSScriptRoot "clean-build.ps1")

$msixBuilt = & (Join-Path $PSScriptRoot "build-msix.ps1") -Platform $Platform
$releaseMsixName = "PetitPlanetWiki_${appxVersion}_${Platform}.msix"
$releaseMsixPath = Join-Path $distDir $releaseMsixName
Copy-Item $msixBuilt $releaseMsixPath -Force

$pfxPath = Join-Path $Root "codesign.pfx"
$signed = $false

if ($env:CERTIFICATE_BASE64 -and $env:CERTIFICATE_PASSWORD) {
    Write-Host ">>> 还原签名证书并签名 MSIX..." -ForegroundColor Cyan
    $certBytes = [Convert]::FromBase64String($env:CERTIFICATE_BASE64)
    [IO.File]::WriteAllBytes($pfxPath, $certBytes)

    & (Join-Path $PSScriptRoot "sign-msix.ps1") `
        -MsixPath $releaseMsixPath `
        -PfxPath $pfxPath `
        -Password $env:CERTIFICATE_PASSWORD

    $signed = $true
}
else {
    Write-Warning "未提供 CERTIFICATE_BASE64 / CERTIFICATE_PASSWORD，跳过 MSIX 签名"
}

& (Join-Path $PSScriptRoot "prepare-installer.ps1")

$iscc = @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
    "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $iscc) {
    throw "未找到 Inno Setup ISCC.exe"
}

Write-Host ">>> 编译 Inno Setup 安装器..." -ForegroundColor Cyan
& $iscc "/DMyAppVersion=$Version" (Join-Path $Root "installer\PetitPlanetWikiSetup.iss")

$setupExe = Join-Path $Root "installer\output\PetitPlanetWikiSetup.exe"
if (-not (Test-Path $setupExe)) {
    throw "Inno Setup 输出不存在: $setupExe"
}

$releaseSetupPath = Join-Path $distDir "PetitPlanetWikiSetup.exe"
Copy-Item $setupExe $releaseSetupPath -Force

if ($signed -and (Test-Path $pfxPath)) {
    & (Join-Path $PSScriptRoot "sign-msix.ps1") `
        -MsixPath $releaseSetupPath `
        -PfxPath $pfxPath `
        -Password $env:CERTIFICATE_PASSWORD
}

# 清理私钥（绝不进入产物目录）
if (Test-Path $pfxPath) {
    Remove-Item $pfxPath -Force
}

Write-Host ">>> 发布产物:" -ForegroundColor Green
Get-ChildItem $distDir | ForEach-Object { Write-Host "  $($_.FullName)" }
