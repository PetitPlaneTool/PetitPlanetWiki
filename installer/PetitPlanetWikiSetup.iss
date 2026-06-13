; 星布谷地Wiki Inno Setup 引导安装程序
; 编译前运行: .\scripts\prepare-installer.ps1
; 编译: ISCC.exe /DMyAppVersion=0.0.2 installer\PetitPlanetWikiSetup.iss

#ifndef MyAppVersion
  #define MyAppVersion "0.0.2"
#endif

#define MyAppName "星布谷地Wiki"
#define MyAppPublisher "露米工作室"
#define MyAppExeName "PetitPlanetWikiSetup.exe"

[Setup]
AppId={{A7B3C4D5-E6F7-4890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=admin
OutputDir=output
OutputBaseFilename=PetitPlanetWikiSetup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
Uninstallable=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "assets\PetitPlanetRootCA.cer"; DestDir: "{tmp}\PetitPlanetWiki"; Flags: deleteafterinstall
Source: "install-app.ps1"; DestDir: "{tmp}\PetitPlanetWiki"; Flags: deleteafterinstall

[Run]
Filename: "powershell.exe"; \
  Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{tmp}\PetitPlanetWiki\install-app.ps1"" -CertPath ""{tmp}\PetitPlanetWiki\PetitPlanetRootCA.cer"""; \
  StatusMsg: "正在安装证书并下载应用..."; \
  Flags: runhidden waituntilterminated

[Messages]
SetupAppTitle=安装 {#MyAppName}
SetupWindowTitle=安装 - {#MyAppName}
WelcomeLabel1=欢迎安装 {#MyAppName}
WelcomeLabel2=本安装程序将自动安装信任证书，并从 GitHub Releases 下载最新 MSIX 安装包。{#13}{#13}点击「下一步」继续。
FinishedLabel=证书已安装，MSIX 安装程序已启动。{#13}{#13}请按照 App Installer 提示完成应用安装。
