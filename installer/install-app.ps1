# 星布谷地Wiki 引导安装脚本（命令行模式，中文详细日志）
# 流程：安装根证书 → 下载 MSIX 到临时目录 → 拉起安装 → 清理临时目录

param(
    [Parameter(Mandatory = $true)]
    [string]$CertPath,

    [string]$MainRepo = "PetitPlaneTool/PetitPlanetWiki",

    [string]$CertRepo = "PetitPlaneTool/certificate",

    [string]$AssetPattern = "PetitPlanetWiki_*.msix"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

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

function Fail([string]$Message) {
    Write-Err $Message
    Write-Host ""
    Write-Host "安装已中止。请检查网络连接与管理员权限后重试。" -ForegroundColor Yellow
    Write-Host "主仓库: https://github.com/$MainRepo" -ForegroundColor Gray
    Write-Host "证书仓库: https://github.com/$CertRepo" -ForegroundColor Gray
    Write-Host ""
    Read-Host "按 Enter 键关闭"
    exit 1
}

$headers = @{ "User-Agent" = "PetitPlanetWiki-Setup/1.0" }
$tempRoot = Join-Path $env:TEMP "PetitPlanetWikiSetup"
$tempDir = Join-Path $tempRoot ("session_" + [Guid]::NewGuid().ToString("N"))
$msixPath = $null
$installed = $false

Write-Title "星布谷地Wiki 安装向导（命令行）"
Write-Info "主仓库: https://github.com/$MainRepo"
Write-Info "证书仓库: https://github.com/$CertRepo"
Write-Info "临时工作目录: $tempDir"
Write-Info "当前用户: $env:USERNAME"
Write-Info "是否管理员: $(([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))"

try {
  # --- 步骤 1：根证书 ---
  Write-Title "步骤 1/4 安装根证书"
  if (-not (Test-Path -LiteralPath $CertPath)) {
    Fail "根证书文件不存在: $CertPath"
  }
  $certItem = Get-Item -LiteralPath $CertPath
  Write-Info "证书文件: $($certItem.FullName)"
  Write-Info "证书大小: $($certItem.Length) 字节"
  Write-Info "目标存储: 本地计算机 → 受信任的根证书颁发机构 (Root)"
  Write-Info "执行命令: certutil -addstore -f Root `"$CertPath`""

  $certOutput = & certutil.exe -addstore -f Root $CertPath 2>&1 | Out-String
  Write-Host $certOutput
  if ($LASTEXITCODE -ne 0) {
    Fail "certutil 安装根证书失败 (退出码 $LASTEXITCODE)"
  }
  Write-Ok "根证书已写入受信任的根证书颁发机构"

  # --- 步骤 2：查询 Release ---
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

  # --- 步骤 3：下载到临时目录 ---
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

  # --- 步骤 4：拉起 MSIX 安装 ---
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
        Write-Info "已删除空目录: $tempRoot"
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
}

Write-Title "全部步骤已完成"
Write-Info "若应用未出现在开始菜单，请从开始菜单搜索「星布谷地Wiki」或重新运行本安装程序。"
Write-Host ""
Read-Host "按 Enter 键关闭安装窗口"
