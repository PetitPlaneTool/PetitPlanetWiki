# 星布谷地Wiki 引导安装脚本
# 在线模式: 下载 MSIX（3 次重试）-> 失败则下载并启动 PetitPlanetWikiSetupFull.exe
# 离线模式: -BundledMsixPath 使用安装包内置 MSIX

param(
    [Parameter(Mandatory = $true)]
    [string]$CertPath,

    [string]$BundledMsixPath = "",

    [string]$MainRepo = "PetitPlaneTool/PetitPlanetWiki",

    [string]$MirrorRepo = "kqx123/petit-planet-wiki",

    [string]$MirrorBranch = "master",

    [string]$CertRepo = "PetitPlaneTool/certificate",

    [string]$AssetPattern = "PetitPlanetWiki_*.msix",

    [string]$FullSetupName = "PetitPlanetWikiSetupFull.exe",

    [int]$DownloadRetries = 3
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
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

function Write-Info([string]$Text) { Write-Host "[信息] $Text" }
function Write-Ok([string]$Text) { Write-Host "[完成] $Text" -ForegroundColor Green }
function Write-Err([string]$Text) { Write-Host "[错误] $Text" -ForegroundColor Red }

function Test-IsAdmin {
    return ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Fail([string]$Message) {
    Write-Err $Message
    Write-Host ""
    Write-Host "安装已中止。日志: $logFile" -ForegroundColor Yellow
    Write-Host "GitHub: https://github.com/$MainRepo" -ForegroundColor Gray
    Write-Host "Gitee: https://gitee.com/$MirrorRepo" -ForegroundColor Gray
    try { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null } catch { }
    exit 1
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
        foreach ($c in $found) { $store.Remove($c) }
    } finally { $store.Close() }
}

function Add-CertToStore(
    [System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate,
    [string]$StoreName,
    [System.Security.Cryptography.X509Certificates.StoreLocation]$Location) {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($StoreName, $Location)
    $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
    try {
        $exists = $store.Certificates.Find(
            [System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,
            $Certificate.Thumbprint,
            $false)
        if ($exists.Count -eq 0) {
            $store.Add($Certificate)
        }
    } finally { $store.Close() }
}

function Install-RootCertificateLocalMachine([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { throw "根证书文件不存在: $Path" }
    if (-not (Test-IsAdmin)) {
        throw "当前未以管理员身份运行。请右键 Setup.exe -> 以管理员身份运行。"
    }

    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($Path)
    Write-Info "证书主题: $($cert.Subject)"
    Write-Info "证书指纹: $($cert.Thumbprint)"
    Write-Info "安装到: 本地计算机 -> 受信任的根证书颁发机构"

    Remove-CertFromStore -StoreName "My" -Location CurrentUser -Thumbprint $cert.Thumbprint
    Remove-CertFromStore -StoreName "My" -Location LocalMachine -Thumbprint $cert.Thumbprint
    Add-CertToStore -Certificate $cert -StoreName "Root" -Location LocalMachine

    $verified = Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Thumbprint -eq $cert.Thumbprint }
    if (-not $verified) { throw "根证书验证失败" }
    Write-Ok "根证书已安装并验证"
}

function Install-MsixTrustChain([string]$MsixPath) {
    Write-Info "配置 MSIX 签名信任链..."
    $sig = Get-AuthenticodeSignature -LiteralPath $MsixPath
    Write-Info "包签名状态: $($sig.Status)"
    if ($sig.StatusMessage) { Write-Info "签名说明: $($sig.StatusMessage)" }

    if ($sig.Signers -and $sig.Signers.Count -gt 0) {
        foreach ($signer in $sig.Signers) {
            Add-CertToStore -Certificate $signer -StoreName "TrustedPublisher" -Location LocalMachine
            Write-Info "已信任发布者证书: $($signer.Subject)"
        }
    }

    if ($sig.ChainElements) {
        foreach ($chainCert in $sig.ChainElements) {
            if ($chainCert.Subject -eq $chainCert.Issuer) {
                Add-CertToStore -Certificate $chainCert -StoreName "Root" -Location LocalMachine
            }
        }
    }

    Start-Sleep -Seconds 2
}

function Invoke-HttpGetJson([string]$Uri) {
    return Invoke-RestMethod -Uri $Uri -Headers $headers -UseBasicParsing -ErrorAction Stop
}

function Invoke-HttpDownload([string]$Uri, [string]$OutFile) {
    Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing -Headers $headers -ErrorAction Stop
}

function Get-GiteeLatestMeta {
    $owner, $repoName = $MirrorRepo -split '/', 2
    $url = "https://gitee.com/$owner/$repoName/raw/$MirrorBranch/releases/latest.json"
    Write-Info "读取 Gitee latest.json: $url"
    return Invoke-HttpGetJson $url
}

function Get-MsixAssetMeta {
    $owner, $repoName = $MirrorRepo -split '/', 2
    $meta = $null

    try {
        $gitee = Get-GiteeLatestMeta
        if ($gitee.filename -and $gitee.download_url) {
            $meta = @{
                Name         = $gitee.filename
                DownloadUrl  = $gitee.download_url
                Size         = [long](if ($gitee.size) { $gitee.size } else { 0 })
                TagName      = $gitee.tag_name
                Source       = "gitee"
                ReleaseUrl   = "https://gitee.com/$owner/$repoName/tree/$MirrorBranch/releases"
            }
            Write-Ok "元数据来自 Gitee latest.json"
            return $meta
        }
    }
    catch {
        Write-Err "Gitee latest.json 失败: $($_.Exception.Message)"
    }

    try {
        $apiUrl = "https://api.github.com/repos/$MainRepo/releases/latest"
        Write-Info "请求 GitHub API: $apiUrl"
        $release = Invoke-HttpGetJson $apiUrl
        $asset = $release.assets | Where-Object { $_.name -like $AssetPattern } | Select-Object -First 1
        if (-not $asset) { $asset = $release.assets | Where-Object { $_.name -like "*.msix" } | Select-Object -First 1 }
        if (-not $asset) { throw "Release 中无 MSIX" }
        $meta = @{
            Name         = $asset.name
            DownloadUrl  = $asset.browser_download_url
            Size         = [long]$asset.size
            TagName      = $release.tag_name
            Source       = "github-api"
            ReleaseUrl   = $release.html_url
        }
        Write-Ok "元数据来自 GitHub API"
        return $meta
    }
    catch {
        Write-Err "GitHub API 失败: $($_.Exception.Message)"
    }

  # 无 API：用 Gitee 元数据拼 GitHub 直链
    try {
        $gitee = Get-GiteeLatestMeta
        $tag = $gitee.tag_name
        $name = $gitee.filename
        if (-not $tag -or -not $name) { throw "latest.json 缺少 tag 或 filename" }
        $direct = "https://github.com/$MainRepo/releases/download/$tag/$name"
        Write-Info "尝试 GitHub 直链: $direct"
        $meta = @{
            Name         = $name
            DownloadUrl  = $direct
            Size         = [long](if ($gitee.size) { $gitee.size } else { 0 })
            TagName      = $tag
            Source       = "github-direct"
            ReleaseUrl   = "https://github.com/$MainRepo/releases/tag/$tag"
        }
        Write-Ok "元数据来自 GitHub 直链（基于 Gitee 版本信息）"
        return $meta
    }
    catch {
        throw "无法获取 MSIX 下载信息: $($_.Exception.Message)"
    }
}

function Download-MsixWithRetries([string]$TargetDir) {
    for ($attempt = 1; $attempt -le $DownloadRetries; $attempt++) {
        Write-Info "下载尝试 $attempt / $DownloadRetries ..."
        try {
            $asset = Get-MsixAssetMeta
            $outPath = Join-Path $TargetDir $asset.Name
            Write-Info "下载源: $($asset.Source) | $($asset.DownloadUrl)"
            Invoke-HttpDownload -Uri $asset.DownloadUrl -OutFile $outPath
            if (-not (Test-Path -LiteralPath $outPath)) { throw "下载后文件不存在" }
            $item = Get-Item -LiteralPath $outPath
            if ($item.Length -lt 1024) { throw "下载文件过小，可能不完整 ($($item.Length) 字节)" }
            Write-Ok "下载完成: $($item.FullName) ($([math]::Round($item.Length / 1MB, 2)) MB)"
            return $outPath
        }
        catch {
            Write-Err "第 $attempt 次失败: $($_.Exception.Message)"
            if ($attempt -lt $DownloadRetries) { Start-Sleep -Seconds 3 }
        }
    }
    return $null
}

function Get-FullSetupUrls([string]$TagName) {
    $owner, $repoName = $MirrorRepo -split '/', 2
    $urls = [System.Collections.Generic.List[string]]::new()
    try {
        $gitee = Get-GiteeLatestMeta
        if ($gitee.full_setup_url) { $urls.Add([string]$gitee.full_setup_url) }
    }
    catch { }
    $urls.Add("https://gitee.com/$owner/$repoName/raw/$MirrorBranch/releases/$FullSetupName")
    if ($TagName) {
        $urls.Add("https://github.com/$MainRepo/releases/download/$TagName/$FullSetupName")
    }
    $urls.Add("https://github.com/$MainRepo/releases/latest/download/$FullSetupName")
    return $urls
}

function Launch-FullSetupFallback {
    param([string]$TagName, [string]$TargetDir)

    Write-Title "切换到离线完整安装包"
    $dest = Join-Path $TargetDir $FullSetupName
    $urls = Get-FullSetupUrls -TagName $TagName

    foreach ($url in $urls) {
        try {
            Write-Info "下载离线包: $url"
            Invoke-HttpDownload -Uri $url -OutFile $dest
            if (-not (Test-Path -LiteralPath $dest)) { continue }
            $len = (Get-Item -LiteralPath $dest).Length
            if ($len -lt 1024) { throw "离线包文件过小" }
            Write-Ok "离线包已下载 ($([math]::Round($len / 1MB, 2)) MB)"
            Write-Info "以管理员权限启动离线安装包..."
            Start-Process -FilePath $dest -Verb RunAs
            Write-Ok "已启动 $FullSetupName，本窗口即将关闭，请在新窗口中完成安装。"
            try { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null } catch { }
            exit 0
        }
        catch {
            Write-Err "离线包下载失败: $url — $($_.Exception.Message)"
        }
    }

    Fail "在线下载 MSIX 失败，且无法获取离线安装包 $FullSetupName"
}

function Install-MsixPackage([string]$MsixPath) {
    Write-Title "启动 MSIX 安装"
    Write-Info "包路径: $MsixPath"

    Install-MsixTrustChain -MsixPath $MsixPath

    $appInstaller = @(
        (Get-ChildItem "$env:ProgramFiles\WindowsApps\Microsoft.DesktopAppInstaller_*_x64__8wekyb3d8bbwe\AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
        (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WindowsApps\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
        (Get-ChildItem "$env:ProgramFiles\Microsoft\AppInstaller" -Recurse -Filter "AppInstaller.exe" -ErrorAction SilentlyContinue | Select-Object -First 1)
    ) | Where-Object { $_.FullName } | Select-Object -First 1

    if ($appInstaller) {
        Write-Info "使用 App Installer: $($appInstaller.FullName)"
        $proc = Start-Process -FilePath $appInstaller.FullName -ArgumentList "`"$MsixPath`"" -PassThru -Wait
        if ($proc -and $null -ne $proc.ExitCode -and $proc.ExitCode -ne 0) {
            Write-Info "App Installer 退出码 $($proc.ExitCode)，尝试 Add-AppxPackage..."
            Add-AppxPackage -Path $MsixPath -ForceUpdateFromAnyVersion -ErrorAction Stop
        }
    }
    else {
        Write-Info "使用 Add-AppxPackage 安装..."
        Add-AppxPackage -Path $MsixPath -ForceUpdateFromAnyVersion -ErrorAction Stop
    }

    Write-Ok "MSIX 安装流程已执行"
}

$headers = @{ "User-Agent" = "PetitPlanetWiki-Setup/1.0" }
$tempRoot = Join-Path $env:TEMP "PetitPlanetWikiSetup"
$tempDir = Join-Path $tempRoot ("session_" + [Guid]::NewGuid().ToString("N"))
$msixPath = $null
$installed = $false
$isBundled = $BundledMsixPath -and (Test-Path -LiteralPath $BundledMsixPath)

Write-Title "星布谷地Wiki 安装向导"
Write-Info "模式: $(if ($isBundled) { '离线（内置 MSIX）' } else { '在线（网络下载）' })"
Write-Info "日志: $logFile"
Write-Info "管理员: $(Test-IsAdmin)"

try {
    Write-Title "步骤 1/3 安装根证书"
    Install-RootCertificateLocalMachine -Path $CertPath

    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    Write-Info "临时目录: $tempDir"

    if ($isBundled) {
        Write-Title "步骤 2/3 释放内置 MSIX"
        $msixPath = Join-Path $tempDir (Split-Path -Leaf $BundledMsixPath)
        Copy-Item -LiteralPath $BundledMsixPath -Destination $msixPath -Force
        Write-Ok "已释放: $msixPath"
    }
    else {
        Write-Title "步骤 2/3 下载 MSIX"
        $msixPath = Download-MsixWithRetries -TargetDir $tempDir
        if (-not $msixPath) {
            $tag = $null
            try { $tag = (Get-GiteeLatestMeta).tag_name } catch { }
            Launch-FullSetupFallback -TagName $tag -TargetDir $tempDir
        }
    }

    Write-Title "步骤 3/3 安装应用"
    Install-MsixPackage -MsixPath $msixPath
    $installed = $true
}
catch {
    if (-not $isBundled) {
        Write-Err $_.Exception.Message
        $tag = $null
        try { $tag = (Get-GiteeLatestMeta).tag_name } catch { }
        Launch-FullSetupFallback -TagName $tag -TargetDir $tempDir
    }
    Fail $_.Exception.Message
}
finally {
    if ($installed -and $tempDir -and (Test-Path -LiteralPath $tempDir)) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    elseif ($tempDir -and (Test-Path -LiteralPath $tempDir) -and $msixPath) {
        Write-Host "[提示] 临时 MSIX 保留: $msixPath" -ForegroundColor Yellow
    }
    try { Stop-Transcript -ErrorAction SilentlyContinue | Out-Null } catch { }
}

Write-Title "全部步骤已完成"
Write-Info "完整日志: $logFile"
exit 0
