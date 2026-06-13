# CI/CD 发布构建：MSIX（签名）+ Inno Setup 在线/离线安装器
param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [string]$Platform = "x64"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $Root "dist"
$appxVersion = if ($Version -match '^\d+\.\d+\.\d+$') { "$Version.0" } else { $Version }

& (Join-Path $PSScriptRoot "clean-build.ps1")
New-Item -ItemType Directory -Path $distDir -Force | Out-Null

Write-Host ">>> 生成 MSIX 图标资源..." -ForegroundColor Cyan
python -m pip install --quiet Pillow
if ($LASTEXITCODE -ne 0) { throw "安装 Pillow 失败" }
python (Join-Path $PSScriptRoot "generate-package-icons.py")
if ($LASTEXITCODE -ne 0) { throw "图标生成失败" }

& (Join-Path $PSScriptRoot "prepare-installer.ps1")

$pfxPath = Join-Path $Root "codesign.pfx"
$signed = $false

if ($env:CERTIFICATE_BASE64 -and $env:CERTIFICATE_PASSWORD) {
    Write-Host ">>> 还原签名证书..." -ForegroundColor Cyan
    $certBytes = [Convert]::FromBase64String($env:CERTIFICATE_BASE64)
    [IO.File]::WriteAllBytes($pfxPath, $certBytes)

    & (Join-Path $PSScriptRoot "sync-appx-publisher.ps1") `
        -PfxPath $pfxPath `
        -Password $env:CERTIFICATE_PASSWORD

    $signed = $true
}

$msixBuilt = & (Join-Path $PSScriptRoot "build-msix.ps1") -Platform $Platform | Select-Object -Last 1
if ([string]::IsNullOrWhiteSpace($msixBuilt) -or -not (Test-Path $msixBuilt)) {
    $appPackages = Join-Path $Root "src\PetitPlanetTool.Package\AppPackages"
    $msixBuilt = (Get-ChildItem -Path $appPackages -Filter "*.msix" -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1).FullName
}
if ([string]::IsNullOrWhiteSpace($msixBuilt) -or -not (Test-Path $msixBuilt)) {
    throw "未找到构建输出的 .msix 文件"
}

$releaseMsixName = "PetitPlanetWiki_${appxVersion}_${Platform}.msix"
$releaseMsixPath = Join-Path $distDir $releaseMsixName
Copy-Item $msixBuilt $releaseMsixPath -Force

if ($signed) {
    & (Join-Path $PSScriptRoot "sign-msix.ps1") `
        -MsixPath $releaseMsixPath `
        -PfxPath $pfxPath `
        -Password $env:CERTIFICATE_PASSWORD
}

$bundleDir = Join-Path $Root "installer\assets"
New-Item -ItemType Directory -Path $bundleDir -Force | Out-Null
Copy-Item $releaseMsixPath (Join-Path $bundleDir "bundle.msix") -Force

$iscc = @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe"
    "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $iscc) { throw "未找到 Inno Setup ISCC.exe" }

$iss = Join-Path $Root "installer\PetitPlanetWikiSetup.iss"

Write-Host ">>> 编译在线安装器 PetitPlanetWikiSetup.exe ..." -ForegroundColor Cyan
& $iscc "/DMyAppVersion=$Version" $iss
if ($LASTEXITCODE -ne 0) { throw "在线安装器编译失败" }

Write-Host ">>> 编译离线安装器 PetitPlanetWikiSetupFull.exe ..." -ForegroundColor Cyan
& $iscc "/DMyAppVersion=$Version" "/DEMBED_MSIX=1" "/DOutputFileName=PetitPlanetWikiSetupFull" $iss
if ($LASTEXITCODE -ne 0) { throw "离线安装器编译失败" }

$setupOnline = Join-Path $Root "installer\output\PetitPlanetWikiSetup.exe"
$setupFull = Join-Path $Root "installer\output\PetitPlanetWikiSetupFull.exe"

if (-not (Test-Path $setupOnline)) { throw "未生成 PetitPlanetWikiSetup.exe" }
if (-not (Test-Path $setupFull)) { throw "未生成 PetitPlanetWikiSetupFull.exe" }

Copy-Item $setupOnline (Join-Path $distDir "PetitPlanetWikiSetup.exe") -Force
Copy-Item $setupFull (Join-Path $distDir "PetitPlanetWikiSetupFull.exe") -Force

if ($signed -and (Test-Path $pfxPath)) {
    foreach ($artifact in @($releaseMsixPath, (Join-Path $distDir "PetitPlanetWikiSetup.exe"), (Join-Path $distDir "PetitPlanetWikiSetupFull.exe"))) {
        & (Join-Path $PSScriptRoot "sign-msix.ps1") `
            -MsixPath $artifact `
            -PfxPath $pfxPath `
            -Password $env:CERTIFICATE_PASSWORD
    }
}

if (Test-Path $pfxPath) { Remove-Item $pfxPath -Force }

Write-Host ">>> 发布产物:" -ForegroundColor Green
Get-ChildItem $distDir | ForEach-Object { Write-Host "  $($_.FullName)" }
