# 从签名 PFX 同步 Package.appxmanifest 中的 Publisher 字段
param(
    [Parameter(Mandatory = $true)]
    [string]$PfxPath,

    [Parameter(Mandatory = $true)]
    [string]$Password
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$manifest = Join-Path $Root "src\PetitPlanetTool.Package\Package.appxmanifest"

if (-not (Test-Path -LiteralPath $PfxPath)) {
    throw "PFX 不存在: $PfxPath"
}

$cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($PfxPath, $Password)
$publisher = $cert.Subject
Write-Host ">>> 签名证书 Subject: $publisher" -ForegroundColor Cyan

$content = Get-Content -LiteralPath $manifest -Raw -Encoding UTF8
$updated = $content -replace 'Publisher="[^"]*"', "Publisher=`"$publisher`""
if ($updated -eq $content) {
    Write-Warning "未找到 Publisher 属性，请检查 manifest"
}
else {
    Set-Content -LiteralPath $manifest -Value $updated -Encoding UTF8 -NoNewline
    Write-Host ">>> 已更新 Package.appxmanifest Publisher" -ForegroundColor Green
}
