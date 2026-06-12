# 为 Inno Setup 准备安装器资源（从证书仓库下载公钥）
# 用法: .\scripts\prepare-installer.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$certUrl = "https://raw.githubusercontent.com/PetitPlaneTool/certificate/main/PetitPlanetRootCA.cer"
$assetsDir = Join-Path $Root "installer\assets"
$certPath = Join-Path $assetsDir "PetitPlanetRootCA.cer"

New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null

Write-Host ">>> Downloading root CA certificate..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $certUrl -OutFile $certPath -UseBasicParsing

if (-not (Test-Path $certPath)) {
    throw "Failed to download root CA certificate"
}

Write-Host ('>>> Saved to {0}' -f $certPath) -ForegroundColor Green
