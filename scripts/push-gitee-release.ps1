# 将 MSIX 同步到 Gitee 国内镜像仓库（Release 附件 + latest.json）
# 用法:
#   $env:GITEE_TOKEN = "<token>"
#   .\scripts\push-gitee-release.ps1 -Version 0.1.6 -MsixPath dist\PetitPlanetWiki_0.1.6.0_x64.msix

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

$token = ($env:GITEE_TOKEN ?? "").Trim()
if ([string]::IsNullOrWhiteSpace($token)) {
    throw "未设置 GITEE_TOKEN，请在 GitHub Environment「CERTIFICATE」中配置 Gitee 私人令牌。"
}

if (-not (Test-Path -LiteralPath $MsixPath)) {
    throw "MSIX 文件不存在: $MsixPath"
}

$tag = if ($Version -match '^v') { $Version } else { "v$Version" }
$repoPath = "$GiteeOwner/$GiteeRepo"
$baseApi = "https://gitee.com/api/v5/repos/$GiteeOwner/$GiteeRepo"
$msixName = Split-Path -Leaf $MsixPath
$msixSize = (Get-Item -LiteralPath $MsixPath).Length

Write-Host ">>> 同步到 Gitee: $repoPath ($tag)" -ForegroundColor Cyan

function Build-GiteeUrl {
    param(
        [string]$ResourcePath,
        [hashtable]$ExtraQuery = @{}
    )

    $query = [ordered]@{ access_token = $token }
    foreach ($key in $ExtraQuery.Keys) {
        $query[$key] = $ExtraQuery[$key]
    }

    $pairs = foreach ($key in $query.Keys) {
        $value = [string]$query[$key]
        "$([Uri]::EscapeDataString($key))=$([Uri]::EscapeDataString($value))"
    }

    $resource = if ($ResourcePath) { $ResourcePath.TrimStart('/') } else { "" }
    $url = if ($resource) { "$baseApi/$resource" } else { $baseApi }
    return "$url?$($pairs -join '&')"
}

function Invoke-GiteeJson {
    param(
        [string]$Method = "GET",
        [string]$ResourcePath = "",
        [hashtable]$ExtraQuery = @{},
        [hashtable]$Form = $null,
        [hashtable]$JsonBody = $null
    )

    $url = Build-GiteeUrl -ResourcePath $ResourcePath -ExtraQuery $ExtraQuery
    Write-Host ">>> API $Method $ResourcePath" -ForegroundColor DarkGray

    try {
        if ($Form) {
            $response = Invoke-WebRequest -Method $Method -Uri $url -Form $Form -UseBasicParsing
        }
        elseif ($JsonBody) {
            $json = $JsonBody | ConvertTo-Json -Compress
            $response = Invoke-WebRequest -Method $Method -Uri $url -ContentType "application/json;charset=UTF-8" -Body $json -UseBasicParsing
        }
        else {
            $response = Invoke-WebRequest -Method $Method -Uri $url -UseBasicParsing
        }
    }
    catch {
        throw "Gitee API 请求失败 ($Method $ResourcePath): $($_.Exception.Message)"
    }

    $text = $response.Content
    if ([string]::IsNullOrWhiteSpace($text) -or $text -eq "null") {
        return $null
    }
    return $text | ConvertFrom-Json
}

function Get-RepoDefaultBranch {
    $repo = Invoke-GiteeJson -ResourcePath ""
    if ($repo -and $repo.default_branch) {
        return $repo.default_branch
    }
    return "master"
}

function Ensure-GiteeTag {
    param([string]$TagName, [string]$Refs)

    $tags = Invoke-GiteeJson -ResourcePath "tags"
    $exists = $false
    if ($tags) {
        $exists = @($tags | Where-Object { $_.name -eq $TagName }).Count -gt 0
    }
    if ($exists) {
        Write-Host ">>> Gitee 标签已存在: $TagName" -ForegroundColor Gray
        return
    }

    Write-Host ">>> 创建 Gitee 标签: $TagName -> $Refs" -ForegroundColor Cyan
    $result = Invoke-GiteeJson -Method POST -ResourcePath "tags" -Form @{
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

    $release = Invoke-GiteeJson -ResourcePath "releases/tags/$TagName"
    if ($release -and $release.id) {
        Write-Host ">>> 已存在 Gitee Release: $TagName (id=$($release.id))" -ForegroundColor Gray
        return $release
    }

    Write-Host ">>> 创建 Gitee Release: $TagName" -ForegroundColor Cyan
    $release = Invoke-GiteeJson -Method POST -ResourcePath "releases" -JsonBody @{
        access_token     = $token
        tag_name         = $TagName
        name             = $TagName
        body             = "星布谷地Wiki $TagName (Gitee 国内镜像)"
        target_commitish = $DefaultBranch
        prerelease       = $false
    }

    if (-not $release -or -not $release.id) {
        $release = Invoke-GiteeJson -ResourcePath "releases/tags/$TagName"
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

# 检查附件是否已存在
$existingNames = @()
try {
    $attachList = Invoke-GiteeJson -ResourcePath "releases/$releaseId/attach_files"
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
    Invoke-GiteeJson -Method POST -ResourcePath "releases/$releaseId/attach_files" -Form @{
        access_token = $token
        file         = Get-Item -LiteralPath $MsixPath
        name         = $msixName
    }
    Write-Host ">>> 附件上传完成" -ForegroundColor Green
}

# 获取下载地址
$downloadUrl = $null
$attachList = Invoke-GiteeJson -ResourcePath "releases/$releaseId/attach_files"
$matched = $attachList | Where-Object { $_.name -eq $msixName } | Select-Object -First 1
if ($matched) {
    if ($matched.browser_download_url) { $downloadUrl = $matched.browser_download_url }
    elseif ($matched.url) { $downloadUrl = $matched.url }
}

if (-not $downloadUrl) {
    $downloadUrl = "https://gitee.com/$repoPath/releases/download/$tag/$msixName"
    Write-Warning "未从 API 获取下载 URL，使用默认格式: $downloadUrl"
}

# 更新 releases/latest.json
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
    $existing = Invoke-GiteeJson -ResourcePath "contents/$latestPath"
    if ($existing -and $existing.sha) { $sha = $existing.sha }
}
catch { }

Write-Host ">>> 更新 Gitee $latestPath" -ForegroundColor Cyan
$body = @{
    access_token = $token
    content      = $contentBase64
    message      = "chore: update latest.json for $tag"
}
if ($sha) { $body.sha = $sha }
Invoke-GiteeJson -Method PUT -ResourcePath "contents/$latestPath" -JsonBody $body

Write-Host ">>> Gitee 镜像同步完成" -ForegroundColor Green
Write-Host "    下载地址: $downloadUrl" -ForegroundColor Gray
