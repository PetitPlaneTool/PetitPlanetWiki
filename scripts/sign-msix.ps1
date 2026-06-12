# 使用 PFX 对 MSIX 进行 signtool 签名
# 用法: .\scripts\sign-msix.ps1 -MsixPath path\to\app.msix -PfxPath codesign.pfx -Password "secret"

param(
    [Parameter(Mandatory = $true)]
    [string]$MsixPath,

    [Parameter(Mandatory = $true)]
    [string]$PfxPath,

    [Parameter(Mandatory = $true)]
    [string]$Password
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $MsixPath)) {
    throw "MSIX 文件不存在: $MsixPath"
}
if (-not (Test-Path $PfxPath)) {
    throw "PFX 文件不存在: $PfxPath"
}

$signtool = Get-ChildItem `
    -Path "${env:ProgramFiles(x86)}\Windows Kits\10\bin" `
    -Recurse -Filter "signtool.exe" -ErrorAction SilentlyContinue | `
    Sort-Object FullName -Descending | `
    Select-Object -First 1

if (-not $signtool) {
    throw "未找到 signtool.exe，请安装 Windows SDK"
}

Write-Host ">>> 签名: $MsixPath" -ForegroundColor Cyan
& $signtool.FullName sign /v /a /fd SHA256 `
    /f $PfxPath `
    /p $Password `
    /tr http://timestamp.digicert.com /td SHA256 `
    $MsixPath

if ($LASTEXITCODE -ne 0) {
    throw "signtool 签名失败 (exit $LASTEXITCODE)"
}

Write-Host ">>> 签名完成" -ForegroundColor Green
