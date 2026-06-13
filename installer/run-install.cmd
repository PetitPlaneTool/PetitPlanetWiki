@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1
cd /d "%~dp0"

set "LOG=%TEMP%\PetitPlanetWikiSetup_install.log"
powershell.exe -NoProfile -Command "Add-Content -LiteralPath '%LOG%' -Value ('[{0}] PetitPlanetWiki Setup started' -f (Get-Date)) -Encoding UTF8; Add-Content -LiteralPath '%LOG%' -Value ('WorkingDir: %~dp0') -Encoding UTF8"

if not exist "%~dp0PetitPlanetRootCA.cer" (
    echo [错误] 未找到根证书: %~dp0PetitPlanetRootCA.cer
    echo [错误] 未找到根证书 >> "%LOG%"
    pause
    exit /b 1
)

if not exist "%~dp0install-app.ps1" (
    echo [错误] 未找到安装脚本: %~dp0install-app.ps1
    pause
    exit /b 1
)

echo 正在启动安装程序，请查看本窗口输出...
echo 日志文件: %LOG%
echo.

if exist "%~dp0bundle.msix" (
    echo [模式] 离线安装包（内置 MSIX）
    powershell.exe -NoProfile -ExecutionPolicy Bypass -NoLogo -WindowStyle Normal -File "%~dp0install-app.ps1" -CertPath "%~dp0PetitPlanetRootCA.cer" -BundledMsixPath "%~dp0bundle.msix"
) else (
    echo [模式] 在线安装包（网络下载 MSIX）
    powershell.exe -NoProfile -ExecutionPolicy Bypass -NoLogo -WindowStyle Normal -File "%~dp0install-app.ps1" -CertPath "%~dp0PetitPlanetRootCA.cer"
)
set "EXITCODE=%ERRORLEVEL%"

echo. >> "%LOG%"
powershell.exe -NoProfile -Command "Add-Content -LiteralPath '%LOG%' -Value ('Exit code: %EXITCODE%') -Encoding UTF8"

echo.
echo ----------------------------------------
echo 退出码: %EXITCODE%
echo 详细日志: %LOG%
echo ----------------------------------------

if %EXITCODE% neq 0 (
    echo 安装失败，请查看上方红色错误信息或打开日志文件。
    pause
    exit /b %EXITCODE%
)

echo 安装流程已结束。
pause
exit /b 0
