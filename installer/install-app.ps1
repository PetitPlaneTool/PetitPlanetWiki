# 星布谷地Wiki 引导安装脚本
# 1. 安装根证书  2. 下载最新 MSIX  3. App Installer 安装  4. 清理临时文件

param(
    [Parameter(Mandatory = $true)]
    [string]$CertPath,

    [string]$Repo = "PetitPlaneTool/PetitPlanetWiki",

    [string]$AssetPattern = "PetitPlanetWiki_*.msix"
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host $Message
}

if (-not (Test-Path $CertPath)) {
    throw "根证书文件不存在: $CertPath"
}

$tempDir = Join-Path $env:TEMP "PetitPlanetWikiSetup_$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    Write-Step "正在安装根证书到「受信任的根证书颁发机构」..."
    $certOutput = & certutil.exe -addstore -f Root $CertPath 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "certutil 安装证书失败: $certOutput"
    }

    Write-Step "正在查询最新 Release..."
    $headers = @{ "User-Agent" = "PetitPlanetWiki-Setup" }
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers $headers

    $asset = $release.assets | Where-Object { $_.name -like $AssetPattern } | Select-Object -First 1
    if (-not $asset) {
        $asset = $release.assets | Where-Object { $_.name -like "*.msix" } | Select-Object -First 1
    }
    if (-not $asset) {
        throw "在 Release $($release.tag_name) 中未找到 MSIX 安装包"
    }

    $msixPath = Join-Path $tempDir $asset.name
    Write-Step "正在下载 $($asset.name) ..."
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msixPath -UseBasicParsing -Headers $headers

    $appInstallerCandidates = @(
        (Get-ChildItem "$env:ProgramFiles\WindowsApps\Microsoft.DesktopAppInstaller_*_x64__8wekyb3d8bbwe\AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
        (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WindowsApps\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
        (Get-ChildItem "$env:ProgramFiles\Microsoft\AppInstaller\*\AppInstaller.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1)
    )

    $appInstaller = $appInstallerCandidates | Where-Object { $_.FullName } | Select-Object -First 1

    if ($appInstaller) {
        Write-Step "正在通过 App Installer 打开安装包..."
        $proc = Start-Process -FilePath $appInstaller.FullName -ArgumentList "`"$msixPath`"" -PassThru -Wait
        if ($proc.ExitCode -ne 0 -and $proc.ExitCode -ne $null) {
            throw "App Installer 退出码: $($proc.ExitCode)"
        }
    }
    else {
        Write-Step "未找到 AppInstaller.exe，尝试 Add-AppxPackage..."
        Add-AppxPackage -Path $msixPath
    }

    Write-Step "安装流程已完成。"
}
finally {
    if (Test-Path $tempDir) {
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
    }
}
