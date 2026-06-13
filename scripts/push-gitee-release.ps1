# 将 MSIX 同步到 Gitee 国内镜像仓库（Release 附件 + latest.json）
# 用法:
#   $env:GITEE_TOKEN = "<token>"
#   .\scripts\push-gitee-release.ps1 -Version 0.1.5 -MsixPath dist\PetitPlanetWiki_0.1.5.0_x64.msix

param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [Parameter(Mandatory = $true)]
    [string]$MsixPath,

    [string]$GiteeOwner = "kqx123",
    [string]$GiteeRepo = "petit-planet-wiki"
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$token = $env:GITEE_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "未设置 GITEE_TOKEN，请在 GitHub Environment「CERTIFICATE」中配置 Gitee 私人令牌。"
}

if (-not (Test-Path -LiteralPath $MsixPath)) {
    throw "MSIX 文件不存在: $MsixPath"
}

$tag = if ($Version -match '^v') { $Version } else { "v$Version" }
$repoPath = "$GiteeOwner/$GiteeRepo"
$baseApi = "https://gitee.com/api/v5/repos/$repoPath"
$msixName = Split-Path -Leaf $MsixPath
$msixSize = (Get-Item -LiteralPath $MsixPath).Length

Write-Host ">>> 同步到 Gitee: $repoPath ($tag)" -ForegroundColor Cyan

function Invoke-GiteeApi {
    param(
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Form = $null,
        [object]$JsonBody = $null
    )

    if ($Form) {
        return Invoke-RestMethod -Method $Method -Uri $Url -Form $Form
    }
    if ($JsonBody) {
        return Invoke-RestMethod -Method $Method -Uri $Url -ContentType "application/json" -Body ($JsonBody | ConvertTo-Json -Compress)
    }
    return Invoke-RestMethod -Method $Method -Uri $Url
}

# 1) 获取或创建 Release
$release = $null
try {
    $release = Invoke-GiteeApi -Url "$baseApi/releases/tags/$tag?access_token=$token"
    Write-Host ">>> 已存在 Gitee Release: $tag (id=$($release.id))" -ForegroundColor Gray
}
catch {
    Write-Host ">>> 创建 Gitee Release: $tag" -ForegroundColor Cyan
    $release = Invoke-GiteeApi -Method POST -Url "$baseApi/releases" -JsonBody @{
        access_token = $token
        tag_name     = $tag
        name         = $tag
        body         = "星布谷地Wiki $tag (Gitee 国内镜像)"
        prerelease   = $false
    }
}

$releaseId = $release.id
if (-not $releaseId) {
    throw "无法获取 Gitee Release ID"
}

# 2) 检查附件是否已存在
$existingNames = @()
try {
    $attachList = Invoke-GiteeApi -Url "$baseApi/releases/$releaseId/attach_files?access_token=$token"
    if ($attachList) {
        $existingNames = @($attachList | ForEach-Object { $_.name })
    }
}
catch {
    Write-Warning "无法列出 Gitee 附件，将尝试直接上传: $($_.Exception.Message)"
}

if ($existingNames -contains $msixName) {
    Write-Host ">>> 附件已存在，跳过上传: $msixName" -ForegroundColor Yellow
}
else {
    Write-Host ">>> 上传 MSIX 附件: $msixName ($([math]::Round($msixSize / 1MB, 2)) MB)" -ForegroundColor Cyan
    $uploadUrl = "$baseApi/releases/$releaseId/attach_files"
    Invoke-GiteeApi -Method POST -Url $uploadUrl -Form @{
        access_token = $token
        file         = Get-Item -LiteralPath $MsixPath
    }
    Write-Host ">>> 附件上传完成" -ForegroundColor Green
}

# 3) 重新读取附件，获取下载地址
$downloadUrl = $null
$attachList = Invoke-GiteeApi -Url "$baseApi/releases/$releaseId/attach_files?access_token=$token"
$matched = $attachList | Where-Object { $_.name -eq $msixName } | Select-Object -First 1
if ($matched) {
  if ($matched.browser_download_url) { $downloadUrl = $matched.browser_download_url }
  elseif ($matched.url) { $downloadUrl = $matched.url }
}

if (-not $downloadUrl) {
    $downloadUrl = "https://gitee.com/$repoPath/releases/download/$tag/$msixName"
    Write-Warning "未从 API 获取下载 URL，使用默认格式: $downloadUrl"
}

# 4) 更新 releases/latest.json（raw 直链回退）
$latestJson = @{
    tag_name     = $tag
    filename     = $msixName
    size         = $msixSize
    download_url = $downloadUrl
    source       = "gitee"
    updated_at   = (Get-Date).ToString("o")
} | ConvertTo-Json -Compress

$latestPath = "releases/latest.json"
$contentBase64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($latestJson))
$sha = $null
try {
    $existing = Invoke-GiteeApi -Url "$baseApi/contents/$latestPath?access_token=$token"
    $sha = $existing.sha
}
catch { }

Write-Host ">>> 更新 Gitee $latestPath" -ForegroundColor Cyan
$body = @{
    access_token = $token
    content      = $contentBase64
    message      = "chore: update latest.json for $tag"
}
if ($sha) { $body.sha = $sha }

Invoke-GiteeApi -Method PUT -Url "$baseApi/contents/$latestPath" -JsonBody $body
Write-Host ">>> Gitee 镜像同步完成" -ForegroundColor Green
Write-Host "    下载地址: $downloadUrl" -ForegroundColor Gray
