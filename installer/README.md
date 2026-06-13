# 星布谷地Wiki 引导安装程序（Inno Setup）

## 安装包类型

| 文件 | 说明 |
|------|------|
| `PetitPlanetWikiSetup.exe` | 在线版：安装证书后从网络下载 MSIX（3 次重试，Gitee/GitHub 多源） |
| `PetitPlanetWikiSetupFull.exe` | 离线版：内置 MSIX；在线版下载失败时自动下载并启动本程序 |

## 用户流程

1. 安装根证书到 **本地计算机 → 受信任的根证书颁发机构**
2. 在线版：下载 MSIX；失败则自动拉取并运行 `PetitPlanetWikiSetupFull.exe`
3. 离线版：直接释放内置 MSIX 并安装
4. 拉起 Windows 应用安装界面

## 本地编译

```powershell
.\scripts\prepare-installer.ps1
# 需先构建 MSIX 并复制到 installer\assets\bundle.msix（release-build 会自动处理）
& "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" /DMyAppVersion=0.1.9 installer\PetitPlanetWikiSetup.iss
& "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" /DMyAppVersion=0.1.9 /DEMBED_MSIX=1 /DOutputFileName=PetitPlanetWikiSetupFull installer\PetitPlanetWikiSetup.iss
```

输出：`installer/output/PetitPlanetWikiSetup.exe` 与 `PetitPlanetWikiSetupFull.exe`
