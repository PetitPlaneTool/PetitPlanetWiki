# MSIX 签名解决方案

> 基于自签名证书的开源项目自动化签名实践

---

## 目录

- [一、方案概述](#一方案概述)
- [二、原理说明](#二原理说明)
- [三、证书生成步骤](#三证书生成步骤)
- [四、GitHub Secrets 配置](#四github-secrets-配置)
- [五、CI/CD 工作流配置](#五cicd-工作流配置)
- [六、用户端安装指引](#六用户端安装指引)
- [七、安全注意事项](#七安全注意事项)
- [八、替代方案对比](#八替代方案对比)

---

## 一、方案概述

本文档提供一套针对**开源 Windows 应用**的 MSIX 打包签名解决方案，采用**自签名证书**结合 **CI/CD 自动化流水线**，实现免费、自动、安全的应用签名打包流程。

该方案适用于：
- 不走 Microsoft Store 上架渠道的开源桌面应用
- 需要通过 GitHub Releases 或其他渠道分发安装包的项目
- 希望零成本解决 MSIX 签名问题的开发团队

用户在**首次安装前**需要手动导入自签名根证书，之后即可正常安装和更新应用。

### 1.1 方案特点

| 特点 | 说明 |
|------|------|
| **零成本** | 自签名证书免费，无需购买商业代码签名证书 |
| **自动化** | CI/CD 全流程自动签名，无需人工干预 |
| **安全存储** | 证书私钥通过 GitHub Secrets 安全存储，不泄露到代码仓库 |
| **完整流程** | 从证书生成、构建打包到签名分发的完整链路 |

### 1.2 签名架构总览

```
开发者本地                    GitHub/CI环境                    用户端
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│  生成自签名   │              │              │              │              │
│  CA根证书    │─────────────>│  Secrets存储  │              │              │
│  +代码签名证  │   .cer公钥    │  CERTIFICATE │              │              │
│  书          │   入仓库      │  PW          │              │              │
└──────────────┘              └──────┬───────┘              └──────┬───────┘
                                     │                             │
                                     ▼                             ▼
                              ┌──────────────┐              ┌──────────────┐
                              │  CI触发构建   │              │ 下载并安装   │
                              │  - 还原PFX   │              │ 根证书       │
                              │  - 签名MSIX  │              │   .cer       │
                              │  - 上传产物  │              │              │
                              └──────┬───────┘              └──────┬───────┘
                                     │                             │
                                     ▼                             ▼
                              ┌──────────────┐              ┌──────────────┐
                              │  Release产物  │────────────>│ 安装MSIX包   │
                              │  .msix       │   下载安装包   │              │
                              └──────────────┘              └──────────────┘
```

---

## 二、原理说明

MSIX 是 Windows 10/11 推荐的应用打包格式，其安全机制要求安装包必须经过数字签名。对于开源项目，可通过以下架构解决签名问题。

### 2.1 签名架构

| 环节 | 说明 |
|------|------|
| **证书生成** | 开发者本地创建自签名 CA 根证书 + 代码签名证书 |
| **安全存储** | PFX Base64 编码 + 密码 存入 GitHub Secrets |
| **CI 签名** | GitHub Actions 还原 PFX 并调用 signtool 签名 |
| **用户安装** | 下载导入根证书后，正常安装 MSIX |

### 2.2 工作流程

1. **开发者**生成本地自签名 CA 根证书和代码签名证书
2. 将**根证书公钥**（.cer）放入仓库，PFX 私钥以 Base64 形式存入 GitHub Secrets
3. **CI 触发**时，从 Secrets 还原 PFX 文件，调用 signtool 签名
4. **用户**下载安装根证书后，即可安装已签名的 MSIX 包

---

## 三、证书生成步骤

在 **PowerShell（管理员权限）** 中执行以下命令，完成证书链的创建和导出。

### 3.1 创建自签名 CA 根证书

```powershell
$rootCert = New-SelfSignedCertificate `
    -Subject "CN=YourProjectRootCA" `
    -KeyUsageProperty Sign `
    -KeyUsage CertSign, CRLSign `
    -CertStoreLocation Cert:\LocalMachine\My `
    -NotAfter (Get-Date).AddYears(10) `
    -FriendlyName "Your Project Root CA"
```

### 3.2 基于根证书签发代码签名证书

```powershell
$codeCert = New-SelfSignedCertificate `
    -Subject "CN=YourProject" `
    -Type CodeSigningCert `
    -Signer $rootCert `
    -CertStoreLocation Cert:\LocalMachine\My `
    -NotAfter (Get-Date).AddYears(5) `
    -FriendlyName "Your Project Code Signing"
```

### 3.3 导出证书文件

```powershell
# 导出根证书公钥（分发给用户）
Export-Certificate `
    -Cert "Cert:\LocalMachine\My\$($rootCert.Thumbprint)" `
    -FilePath "YourProjectRootCA.cer"

# 导出 PFX 签名证书（CI 使用）
$pw = ConvertTo-SecureString -String "YourStrongPassword!" -Force -AsPlainText
Export-PfxCertificate `
    -Cert "Cert:\LocalMachine\My\$($codeCert.Thumbprint)" `
    -FilePath "codesign.pfx" `
    -Password $pw
```

> **执行完成后**，你将得到两个文件：
> - `YourProjectRootCA.cer` — 给用户安装
> - `codesign.pfx` — CI 签名用

---

## 四、GitHub Secrets 配置

### 4.1 转换 PFX 为 Base64

```powershell
[Convert]::ToBase64String((Get-Content -Path "codesign.pfx" -Encoding Byte)) | Set-Clipboard
```

将输出的完整 Base64 字符串复制到剪贴板，准备添加到 Secrets。

### 4.2 添加 Secrets

进入 GitHub 仓库：**Settings → Secrets and variables → Actions → New repository secret**，创建以下两个 Secret：

| Secret 名称 | 值 |
|-------------|-----|
| `CERTIFICATE` | codesign.pfx 的完整 Base64 编码内容 |
| `PW` | 导出 PFX 时设置的密码 |

> **警告**：PFX 文件本身**不要**提交到 Git 仓库！只将 `.cer` 公钥文件置于仓库中。

---

## 五、CI/CD 工作流配置

创建 `.github/workflows/build.yml`：

```yaml
name: Build and Sign MSIX

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: windows-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Build (disable auto-sign)
        run: dotnet build YourProject.csproj -c Release `
          /p:Platform=x64 `
          /p:UapAppxPackageBuildMode=SideloadOnly `
          /p:AppxPackageSigningEnabled=false `
          /p:AppxBundle=Never

      - name: Prepare certificate
        shell: pwsh
        run: |
          $certBytes = [Convert]::FromBase64String("${{ secrets.CERTIFICATE }}")
          [IO.File]::WriteAllBytes("codesign.pfx", $certBytes)

      - name: Sign MSIX
        shell: pwsh
        run: |
          $signtool = Get-ChildItem `
            -Path "C:\Program Files (x86)\Windows Kits\10\bin" `
            -Recurse -Filter "signtool.exe" | `
            Sort-Object FullName -Descending | `
            Select-Object -First 1
          & $signtool.FullName sign /v /a /fd SHA256 `
            /f codesign.pfx `
            /p ${{ secrets.PW }} `
            /tr http://timestamp.digicert.com /td SHA256 `
            "path\to\output.msix"

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: Signed-MSIX
          path: path\to\output.msix
```

### 5.1 关键配置说明

| 参数 | 说明 |
|------|------|
| `AppxPackageSigningEnabled=false` | 禁用 MSBuild 自动签名，后续手动签名 |
| `UapAppxPackageBuildMode=SideloadOnly` | 仅生成侧载包，不走 Store |
| `AppxBundle=Never` | 不生成 Bundle，单个 MSIX |
| `/fd SHA256` | 使用 SHA256 摘要算法 |
| `/tr http://timestamp.digicert.com` | 附加时间戳，确保签名在证书过期后仍有效 |

### 5.2 签名命令详解

```
signtool.exe sign /v /a /fd SHA256 /f codesign.pfx /p <密码> /tr http://timestamp.digicert.com /td SHA256 <文件>
```

| 参数 | 含义 |
|------|------|
| `/v` | 详细输出 |
| `/a` | 自动选择最佳证书 |
| `/fd SHA256` | 文件摘要算法 |
| `/f` | PFX 证书文件路径 |
| `/p` | PFX 密码 |
| `/tr` | RFC 3161 时间戳服务器 |
| `/td SHA256` | 时间戳摘要算法 |

---

## 六、用户端安装指引

### 6.1 安装步骤

1. **下载根证书**：`YourProjectRootCA.cer`
2. **安装证书**：双击 `.cer` 文件 → 安装证书 → 选择"本地计算机" → 放置到"受信任的根证书颁发机构" → 完成
3. **安装应用**：双击 `.msix` 或 `.appinstaller` 文件安装

### 6.2 README 模板

建议在 README 和 Release 页面添加以下指引：

```markdown
## 首次安装指引

由于本应用使用自签名证书打包，安装前需要导入根证书：

1. 下载 [YourProjectRootCA.cer]
2. 双击安装到"受信任的根证书颁发机构"
3. 安装 .msix 文件
```

---

## 七、安全注意事项

### 7.1 安全红线

- **PFX 和密码永远不要出现在代码仓库中**（使用 GitHub Secrets）
- 如果 PFX 泄露，任何人都能伪造你的签名，需要**立即重新生成**
- 定期（如每年）轮换证书是良好实践

### 7.2 证书管理

| 项目 | 建议 |
|------|------|
| **有效期** | 根证书 10 年，代码签名证书 5 年 |
| **过期处理** | 重新生成 PFX → 更新 Secrets → 通知用户更新根证书 |
| **轮换周期** | 建议每年审查一次证书有效期 |

---

## 八、替代方案对比

| 方案 | 成本 | 适用场景 |
|------|------|----------|
| **自签名证书**（本文方案） | 免费 | 开源项目、测试版本、内部工具 |
| **Microsoft Store** | $19 一次性（开发者账号） | 面向普通消费者，Store 代签名 |
| **SignPath 免费计划** | 免费 | 开源项目云端签名 |
| **商业代码签名**（如 Sectigo） | ~$200/年 | 需要 SmartScreen 信任积累 |
| **Azure Trusted Signing** | 按次计费 | 微软新服务，正在公测 |

**本方案**（自签名证书 + CI/CD）适合：
- 开源项目
- 面向开发者或技术用户
- 不走 Microsoft Store 分发

如果应用需要**面向大规模普通用户**且无安装门槛，建议购买商业代码签名证书或上架 Microsoft Store。

---

## 参考项目

本方案参考了 [Snap.Hutao.Remastered](https://github.com/SnapHutaoRemasteringProject/Snap.Hutao.Remastered) 项目的实现方式，该项目使用 Cake 构建脚本 + GitHub Actions 实现了完整的 MSIX 自动化签名流程。
