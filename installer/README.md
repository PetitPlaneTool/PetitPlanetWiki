# 星布谷地Wiki 引导安装程序（Inno Setup）

用户双击 `PetitPlanetWikiSetup.exe` 后的流程（**可见命令行窗口**，中文步骤日志）：

1. 将内置 `PetitPlanetRootCA.cer` 安装到 **本地计算机 → 受信任的根证书颁发机构**（`Cert:\LocalMachine\Root`）
2. 优先从 GitHub Releases 下载最新 `PetitPlanetWiki_*.msix`；若 GitHub 不可用，从 Gitee 镜像仓库 `master/releases/` 下载（见 [petit-planet-wiki](https://gitee.com/kqx123/petit-planet-wiki)）
3. 下载到 `%TEMP%\PetitPlanetWikiSetup\session_*`，调用 `AppInstaller.exe` 或系统关联打开 MSIX
4. 安装成功后删除临时目录

根证书公钥来源：[certificate 仓库](https://github.com/PetitPlaneTool/certificate)

## 本地编译

```powershell
# 需安装 Inno Setup 6: https://jrsoftware.org/isinfo.php
.\scripts\prepare-installer.ps1
& "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" /DMyAppVersion=0.1.5 installer\PetitPlanetWikiSetup.iss
```

输出：`installer/output/PetitPlanetWikiSetup.exe`

CI 发布流水线会自动编译并上传至 GitHub Releases，并通过 git 将 MSIX 推送到 Gitee 镜像仓库的 `master/releases/` 目录。
