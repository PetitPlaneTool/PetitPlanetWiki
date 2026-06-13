# 星布谷地Wiki 引导安装脚本（命令行模式，中文详细日志）
# 流程：安装根证书到本地计算机\受信任的根证书颁发机构 → 下载 MSIX → 拉起安装 → 清理

param(
    [Parameter(Mandatory = $true)]
    [string]$CertPath,

    [string]$MainRepo = "PetitPlaneTool/PetitPlanetWiki",

    [string]$CertRepo = "PetitPlaneTool/certificate",

    [string]$AssetPattern = "PetitPlanetWiki_*.msix"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$logFile = Join-Path $env:TEMP "PetitPlanetWikiSetup_install.log"
try {
    Start-Transcript -Path $logFile -Append -ErrorAction SilentlyContinue | Out-Null
} catch { }

function Write-Title([string]$Text) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Info([string]$Text) {
    Write-Host "[信息] $Text"
}

function Write-Ok([string]$Text) {
    Write-Host "[完成] $Text" -ForegroundColor Green
}

function Write-Err([string]$Text) {
    Write-Host "[错误] $Text" -ForegroundColor Red
}

function Test-IsAdmin {
    return ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Remove-CertFromStore(
    [string]$StoreName,
    [System.Security.Cryptography.X509Certificates.StoreLocation]$Location,
    [string]$Thumbprint) {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($StoreName, $Location)
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    try {
        $found = $store.Certificates.Find(
            [System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,
            $Thumbprint,
            $false)
        foreach ($c in $found) {
            $store.Remove($c)
            Write-Info "已从 $Location\$StoreName 移除误装证书 (指纹: $Thumbprint)"
        }
    } finally {
        $store.Close()
    }
}

function Install-RootCertificateLocalMachine([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "根证书文件不存在: $Path"
    }

    if (-not (Test-IsAdmin)) {
        throw "当前未以管理员身份运行，无法安装到「本地计算机\受信任的根证书颁发机构」。请右键 Setup.exe → 以管理员身份运行。"
    }

    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($Path)
    Write-Info "证书文件: $((Resolve-Path -LiteralPath $Path).Path)"
    Write-Info "证书主题: $($cert.Subject)"
    Write-Info "证书颁发者: $($cert.Issuer)"
    Write-Info "证书指纹: $($cert.Thumbprint)"
    Write-Info "安装目标: 本地计算机 → 受信任的根证书颁发机构"
    Write-Info "证书存储路径: Cert:\LocalMachine\Root"
    Write-Info "certmgr 查看: certmgr.msc → 本地计算机 → 受信任的根证书颁发机构"

    # 若误装到「个人」，先移除
    Remove-CertFromStore -StoreName "My" -Location CurrentUser -Thumbprint $cert.Thumbprint
    Remove-CertFromStore -StoreName "My" -Location LocalMachine -Thumbprint $cert.Thumbprint

    $rootStore = New-Object System.Security.Cryptography.X509Certificates.X509Store(
        "Root",
        [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine)
    $rootStore.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    try {
        $exists = $rootStore.Certificates.Find(
            [System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,
            $cert.Thumbprint,
            $false)
        if ($exists.Count -gt 0) {
            Write-Info "根证书已存在于本地计算机\受信任的根证书颁发机构，跳过重复安装"
        } else {
            $rootStore.Add($cert)
            Write-Ok "根证书已写入本地计算机\受信任的根证书颁发机构"
        }
    } finally {
        $rootStore.Close()
    }

    $verified = Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Thumbprint -eq $cert.Thumbprint }
    if (-not $verified) {
        throw "验证失败：Cert:\LocalMachine\Root 中未找到该证书"
    }
    Write-Ok "验证成功：请在 certmgr.msc 的「本地计算机 → 受信任的根证书颁发机构」中查看"
}

function Fail([string]$Message) {
    Write-Err $Message
    Write-Host ""
    Write-Host "安装已中止。日志: $logFile" -ForegroundColor Yellow
    Write-Host "主仓库: https://github.com/$MainRepo" -ForegroundColor Gray
    Write-Host "证书仓库: https://github.com/$CertRepo" -ForegroundColor Gray
    try { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null } catch { }
    exit 1
}

$headers = @{ "User-Agent" = "PetitPlanetWiki-Setup/1.0" }
$tempRoot = Join-Path $env:TEMP "PetitPlanetWikiSetup"
$tempDir = Join-Path $tempRoot ("session_" + [Guid]::NewGuid().ToString("N"))
$msixPath = $null
$installed = $false

Write-Title "星布谷地Wiki 安装向导（命令行）"
Write-Info "日志文件: $logFile"
Write-Info "主仓库: https://github.com/$MainRepo"
Write-Info "证书仓库: https://github.com/$CertRepo"
Write-Info "当前用户: $env:USERNAME"
Write-Info "管理员权限: $(Test-IsAdmin)"

try {
    Write-Title "步骤 1/4 安装根证书"
    Install-RootCertificateLocalMachine -Path $CertPath

    Write-Title "步骤 2/4 获取最新 MSIX 下载地址"
    $releaseUrl = "https://api.github.com/repos/$MainRepo/releases/latest"
    Write-Info "请求: $releaseUrl"
    $release = Invoke-RestMethod -Uri $releaseUrl -Headers $headers
    Write-Info "最新版本标签: $($release.tag_name)"
    Write-Info "Release 页面: $($release.html_url)"

    $asset = $release.assets | Where-Object { $_.name -like $AssetPattern } | Select-Object -First 1
    if (-not $asset) {
        $asset = $release.assets | Where-Object { $_.name -like "*.msix" } | Select-Object -First 1
    }
    if (-not $asset) {
        Fail "在 Release $($release.tag_name) 中未找到 MSIX 文件（匹配: $AssetPattern）"
    }

    Write-Info "安装包名称: $($asset.name)"
    Write-Info "下载地址: $($asset.browser_download_url)"
    Write-Info "文件大小: $([math]::Round($asset.size / 1MB, 2)) MB ($($asset.size) 字节)"

    Write-Title "步骤 3/4 下载 MSIX 到临时目录"
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Info "临时目录: $tempDir"
    $msixPath = Join-Path $tempDir $asset.name
    Write-Info "保存路径: $msixPath"
    Write-Info "正在下载，请稍候..."

    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $msixPath -UseBasicParsing -Headers $headers

    if (-not (Test-Path -LiteralPath $msixPath)) {
        Fail "下载失败，文件不存在: $msixPath"
    }
    $msixItem = Get-Item -LiteralPath $msixPath
    Write-Ok "下载完成"
    Write-Info "本地文件: $($msixItem.FullName)"
    Write-Info "本地大小: $([math]::Round($msixItem.Length / 1MB, 2)) MB ($($msixItem.Length) 字节)"

    Write-Title "步骤 4/4 启动 MSIX 安装程序"
    Write-Info "将打开 Windows 应用安装界面，请按提示完成安装。"

    $appInstaller = @(
        (Get-ChildItem "$env:ProgramFiles\WindowsApps\Microsoft.DesktopAppInstaller_*_x64__8wekyb3d8bbwe\AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
        (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WindowsApps\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
        (Get-ChildItem "$env:ProgramFiles\Microsoft\AppInstaller" -Recurse -Filter "AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
    ) | Where-Object { $_.FullName } | Select-Object -First 1

    if ($appInstaller) {
        Write-Info "使用 App Installer: $($appInstaller.FullName)"
        Write-Info "执行命令: `"$($appInstaller.FullName)`" `"$msixPath`""
        $proc = Start-Process -FilePath $appInstaller.FullName -ArgumentList "`"$msixPath`"" -PassThru -Wait
        $exitCode = $proc.ExitCode
        Write-Info "App Installer 退出码: $exitCode"
        if ($null -ne $exitCode -and $exitCode -ne 0) {
            Write-Info "App Installer 未成功，尝试 Add-AppxPackage..."
            Add-AppxPackage -Path $msixPath
        }
        $installed = $true
    }
    else {
        Write-Info "未找到 AppInstaller.exe，使用系统关联打开 MSIX..."
        Write-Info "执行命令: Start-Process `"$msixPath`""
        $proc = Start-Process -FilePath $msixPath -PassThru -Wait
        if ($proc -and $null -ne $proc.ExitCode -and $proc.ExitCode -ne 0) {
            Write-Info "关联打开失败，尝试 Add-AppxPackage..."
            Add-AppxPackage -Path $msixPath
        }
        $installed = $true
    }

    Write-Ok "MSIX 安装流程已执行"
}
catch {
    Fail $_.Exception.Message
}
finally {
    if ($installed -and $tempDir -and (Test-Path -LiteralPath $tempDir)) {
        Write-Title "清理临时文件"
        Write-Info "删除目录: $tempDir"
        Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        if (Test-Path -LiteralPath $tempRoot) {
            $empty = @(Get-ChildItem -LiteralPath $tempRoot -ErrorAction SilentlyContinue).Count -eq 0
            if ($empty) {
                Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Ok "临时文件已清理"
    }
    elseif ($tempDir -and (Test-Path -LiteralPath $tempDir)) {
        Write-Host ""
        Write-Host "[提示] 安装未完全成功，临时文件保留在: $tempDir" -ForegroundColor Yellow
        if ($msixPath -and (Test-Path -LiteralPath $msixPath)) {
            Write-Host "[提示] 可手动双击安装: $msixPath" -ForegroundColor Yellow
        }
    }
    try { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null } catch { }
}

Write-Title "全部步骤已完成"
Write-Info "若应用未出现在开始菜单，请从开始菜单搜索「星布谷地Wiki」。"
Write-Info "完整日志: $logFile"
exit 0
