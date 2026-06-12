# 清理本地构建产物与临时签名文件
# 用法: .\scripts\clean-build.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

$paths = @(
    "frontend\dist",
    "frontend\dist-ssr",
    "src\PetitPlanetTool.Host\Assets\Web",
    "src\PetitPlanetTool.Host\bin",
    "src\PetitPlanetTool.Host\obj",
    "src\PetitPlanetTool.Core\bin",
    "src\PetitPlanetTool.Core\obj",
    "src\PetitPlanetTool.Package\AppPackages",
    "src\PetitPlanetTool.Package\BundleArtifacts",
    "src\PetitPlanetTool.Package\bin",
    "src\PetitPlanetTool.Package\obj",
    "installer\output",
    "dist"
)

Write-Host ">>> 清理构建产物..." -ForegroundColor Cyan
foreach ($rel in $paths) {
    $p = Join-Path $Root $rel
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force
        Write-Host "  已删除 $rel" -ForegroundColor DarkGray
    }
}

$tempFiles = @(
    (Join-Path $Root "codesign.pfx"),
    (Join-Path $Root "installer\assets\PetitPlanetRootCA.cer")
)
foreach ($f in $tempFiles) {
    if (Test-Path $f) {
        Remove-Item $f -Force
        Write-Host "  已删除 $(Split-Path $f -Leaf)" -ForegroundColor DarkGray
    }
}

Write-Host ">>> 清理完成" -ForegroundColor Green
