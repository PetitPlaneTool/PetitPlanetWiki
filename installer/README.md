# 星布谷地Wiki 引导安装程序（Inno Setup）

用户双击 `PetitPlanetWikiSetup.exe` 后的流程：

1. 内置 `PetitPlanetRootCA.cer`（来自 [certificate 仓库](https://github.com/PetitPlaneTool/certificate)）
2. `certutil -addstore Root` 安装根证书
3. 从 [PetitPlanetWiki Releases](https://github.com/PetitPlaneTool/PetitPlanetWiki/releases) 下载最新 `PetitPlanetWiki_*.msix`
4. 调用 `AppInstaller.exe` 打开 MSIX（回退 `Add-AppxPackage`）
5. 清理 `%TEMP%` 临时文件

## 本地编译

```powershell
# 需安装 Inno Setup 6: https://jrsoftware.org/isinfo.php
.\scripts\prepare-installer.ps1
& "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" /DMyAppVersion=0.0.2 installer\PetitPlanetWikiSetup.iss
```

输出：`installer/output/PetitPlanetWikiSetup.exe`

CI 发布流水线会自动编译并上传至 GitHub Releases。
