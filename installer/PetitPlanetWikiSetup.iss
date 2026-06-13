; 星布谷地Wiki Inno Setup 引导安装程序
; 在线版: ISCC /DMyAppVersion=0.1.9 installer\PetitPlanetWikiSetup.iss
; 离线版: ISCC /DMyAppVersion=0.1.9 /DEMBED_MSIX=1 /DOutputFileName=PetitPlanetWikiSetupFull installer\PetitPlanetWikiSetup.iss

#ifndef MyAppVersion
  #define MyAppVersion "0.1.9"
#endif

#ifndef OutputFileName
  #define OutputFileName "PetitPlanetWikiSetup"
#endif

#define MyAppName "星布谷地Wiki"
#define MyAppPublisher "露米工作室"

[Setup]
AppId={{A7B3C4D5-E6F7-4890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableFinishedPage=no
PrivilegesRequired=admin
OutputDir=output
OutputBaseFilename={#OutputFileName}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
Uninstallable=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "assets\PetitPlanetRootCA.cer"; DestDir: "{tmp}"; Flags: dontcopy
Source: "install-app.ps1"; DestDir: "{tmp}"; Flags: dontcopy
Source: "run-install.cmd"; DestDir: "{tmp}"; Flags: dontcopy
#ifdef EMBED_MSIX
Source: "assets\bundle.msix"; DestDir: "{tmp}"; DestName: "bundle.msix"; Flags: dontcopy
#endif

[Run]
Filename: "{sys}\cmd.exe"; \
  Parameters: "/c ""{tmp}\run-install.cmd"""; \
  WorkingDir: "{tmp}"; \
  StatusMsg: "正在安装证书并准备应用（请查看命令行窗口）..."; \
  Flags: postinstall waituntilterminated

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    ExtractTemporaryFile('PetitPlanetRootCA.cer');
    ExtractTemporaryFile('install-app.ps1');
    ExtractTemporaryFile('run-install.cmd');
#ifdef EMBED_MSIX
    ExtractTemporaryFile('bundle.msix');
#endif
  end;
end;

[Messages]
SetupAppTitle=安装 {#MyAppName}
SetupWindowTitle=安装 - {#MyAppName}
WelcomeLabel1=欢迎安装 {#MyAppName}
#ifdef EMBED_MSIX
WelcomeLabel2=本安装包已内置 MSIX，将自动完成：{#13}1. 安装根证书到「本地计算机\受信任的根证书颁发机构」{#13}2. 释放并安装内置 MSIX{#13}{#13}点击「下一步」继续。安装过程请勿关闭黑色命令行窗口。
#else
WelcomeLabel2=本程序将打开命令行窗口，自动完成：{#13}1. 安装根证书{#13}2. 从网络下载最新 MSIX（失败时自动切换离线完整包）{#13}3. 启动 MSIX 安装界面{#13}{#13}点击「下一步」继续。安装过程请勿关闭黑色命令行窗口。
#endif
FinishedLabel=命令行安装流程已结束。{#13}{#13}若尚未完成应用安装，请查看刚才的命令行窗口或 %TEMP%\PetitPlanetWikiSetup_install.log。
