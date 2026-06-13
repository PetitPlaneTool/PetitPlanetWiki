# 构建未签名的 MSIX 包
# 用法: .\scripts\build-msix.ps1 [-Configuration Release] [-Platform x64]

param(
    [string]$Configuration = "Release",
    [string]$Platform = "x64"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot "build-frontend.ps1")

$wapproj = Join-Path $Root "src\PetitPlanetTool.Package\PetitPlanetTool (Package).wapproj"
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"

$msbuild = $null
if (Test-Path $vswhere) {
    $msbuild = & $vswhere -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1
}
if (-not $msbuild) {
    $msbuild = "msbuild"
}

Write-Host ">>> 构建 MSIX ($Configuration | $Platform)..." -ForegroundColor Cyan
& $msbuild $wapproj /restore /m `
    /p:Configuration=$Configuration `
    /p:Platform=$Platform `
    /p:AppxPackageSigningEnabled=false `
    /p:UapAppxPackageBuildMode=SideloadOnly `
    /p:AppxBundle=Never `
    /nologo /v:m | Out-Host

if ($LASTEXITCODE -ne 0) {
    throw "MSBuild 失败 (exit $LASTEXITCODE)"
}

$appPackages = Join-Path $Root "src\PetitPlanetTool.Package\AppPackages"
$msix = Get-ChildItem -Path $appPackages -Filter "*.msix" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $msix) {
    throw "未在 AppPackages 中找到 .msix 文件"
}

Write-Host ">>> MSIX 输出: $($msix.FullName)" -ForegroundColor Green
Write-Output $msix.FullName
