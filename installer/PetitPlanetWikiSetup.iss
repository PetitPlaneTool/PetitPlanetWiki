; 星布谷地Wiki Inno Setup 引导安装程序
; 编译前: .\scripts\prepare-installer.ps1
; 编译: ISCC.exe /DMyAppVersion=0.1.8 installer\PetitPlanetWikiSetup.iss

#ifndef MyAppVersion
  #define MyAppVersion "0.1.8"
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
OutputBaseFilename=PetitPlanetWikiSetup
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

[Run]
Filename: "{sys}\cmd.exe"; \
  Parameters: "/c ""{tmp}\run-install.cmd"""; \
  WorkingDir: "{tmp}"; \
  StatusMsg: "正在安装证书并下载应用（请查看命令行窗口）..."; \
  Flags: postinstall waituntilterminated

[Code]
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    ExtractTemporaryFile('PetitPlanetRootCA.cer');
    ExtractTemporaryFile('install-app.ps1');
    ExtractTemporaryFile('run-install.cmd');
  end;
end;

[Messages]
SetupAppTitle=安装 {#MyAppName}
SetupWindowTitle=安装 - {#MyAppName}
WelcomeLabel1=欢迎安装 {#MyAppName}
WelcomeLabel2=本程序将打开命令行窗口，自动完成：{#13}1. 将根证书安装到「本地计算机\受信任的根证书颁发机构」{#13}2. 从 GitHub Releases 下载最新 MSIX{#13}3. 启动 MSIX 安装界面{#13}{#13}点击「下一步」继续。安装过程请勿关闭黑色命令行窗口。
FinishedLabel=命令行安装流程已结束。{#13}{#13}若尚未完成应用安装，请查看刚才的命令行窗口或 %TEMP%\PetitPlanetWikiSetup_install.log。
