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

function Invoke-GiteeRaw {
    param(
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Form = $null,
        [string]$JsonBody = $null
    )

    $params = @{
        Method = $Method
        Uri    = $Url
    }

    if ($Form) {
        $params.Form = $Form
    }
    elseif ($JsonBody) {
        $params.ContentType = "application/json;charset=UTF-8"
        $params.Body = $JsonBody
    }

    $response = Invoke-WebRequest @params -UseBasicParsing
    $text = $response.Content
    if ([string]::IsNullOrWhiteSpace($text) -or $text -eq "null") {
        return $null
    }
    return $text | ConvertFrom-Json
}

function Get-RepoDefaultBranch {
    $repo = Invoke-GiteeRaw -Url "$baseApi?access_token=$token"
    if ($repo -and $repo.default_branch) {
        return $repo.default_branch
    }
    return "master"
}

function Ensure-GiteeTag {
    param([string]$TagName, [string]$Refs)

    $tags = Invoke-GiteeRaw -Url "$baseApi/tags?access_token=$token"
    $exists = $false
    if ($tags) {
        $exists = @($tags | Where-Object { $_.name -eq $TagName }).Count -gt 0
    }
    if ($exists) {
        Write-Host ">>> Gitee 标签已存在: $TagName" -ForegroundColor Gray
        return
    }

    Write-Host ">>> 创建 Gitee 标签: $TagName -> $Refs" -ForegroundColor Cyan
    $result = Invoke-GiteeRaw -Method POST -Url "$baseApi/tags" -Form @{
        access_token = $token
        tag_name     = $TagName
        refs         = $Refs
    }
    if (-not $result) {
        throw "创建 Gitee 标签失败: $TagName"
    }
}

function Get-OrCreateGiteeRelease {
    param([string]$TagName, [string]$DefaultBranch)

    $release = Invoke-GiteeRaw -Url "$baseApi/releases/tags/$TagName?access_token=$token"
    if ($release -and $release.id) {
        Write-Host ">>> 已存在 Gitee Release: $TagName (id=$($release.id))" -ForegroundColor Gray
        return $release
    }

    Write-Host ">>> 创建 Gitee Release: $TagName" -ForegroundColor Cyan
    $bodyObj = @{
        access_token     = $token
        tag_name         = $TagName
        name             = $TagName
        body             = "星布谷地Wiki $TagName (Gitee 国内镜像)"
        target_commitish = $DefaultBranch
        prerelease       = $false
    }
    $json = $bodyObj | ConvertTo-Json -Compress
    $release = Invoke-GiteeRaw -Method POST -Url "$baseApi/releases" -JsonBody $json

    if (-not $release -or -not $release.id) {
        # 创建后再次查询（部分情况下 POST 响应不含 id）
        $release = Invoke-GiteeRaw -Url "$baseApi/releases/tags/$TagName?access_token=$token"
    }

    if (-not $release -or -not $release.id) {
        throw "无法获取 Gitee Release ID（标签: $TagName）。请确认令牌具备 projects 权限且仓库可写。"
    }

    Write-Host ">>> Gitee Release 就绪: id=$($release.id)" -ForegroundColor Green
    return $release
}

$defaultBranch = Get-RepoDefaultBranch
Write-Host ">>> 默认分支: $defaultBranch" -ForegroundColor Gray

Ensure-GiteeTag -TagName $tag -Refs $defaultBranch
$release = Get-OrCreateGiteeRelease -TagName $tag -DefaultBranch $defaultBranch
$releaseId = $release.id

# 2) 检查附件是否已存在
$existingNames = @()
try {
    $attachList = Invoke-GiteeRaw -Url "$baseApi/releases/$releaseId/attach_files?access_token=$token"
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
    Invoke-GiteeRaw -Method POST -Url "$baseApi/releases/$releaseId/attach_files" -Form @{
        access_token = $token
        file         = Get-Item -LiteralPath $MsixPath
        name         = $msixName
    }
    Write-Host ">>> 附件上传完成" -ForegroundColor Green
}

# 3) 重新读取附件，获取下载地址
$downloadUrl = $null
$attachList = Invoke-GiteeRaw -Url "$baseApi/releases/$releaseId/attach_files?access_token=$token"
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
    $existing = Invoke-GiteeRaw -Url "$baseApi/contents/$latestPath?access_token=$token"
    if ($existing -and $existing.sha) { $sha = $existing.sha }
}
catch { }

Write-Host ">>> 更新 Gitee $latestPath" -ForegroundColor Cyan
$bodyObj = @{
    access_token = $token
    content      = $contentBase64
    message      = "chore: update latest.json for $tag"
}
if ($sha) { $bodyObj.sha = $sha }
$putJson = $bodyObj | ConvertTo-Json -Compress
Invoke-GiteeRaw -Method PUT -Url "$baseApi/contents/$latestPath" -JsonBody $putJson

Write-Host ">>> Gitee 镜像同步完成" -ForegroundColor Green
Write-Host "    下载地址: $downloadUrl" -ForegroundColor Gray
