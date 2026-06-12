# 构建前端生产产物
# 用法: .\scripts\build-frontend.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$FrontendDir = Join-Path $Root "frontend"

Write-Host ">>> 正在构建前端 (pnpm build)..." -ForegroundColor Cyan
Push-Location $FrontendDir
try {
    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Write-Host "未找到 pnpm，尝试使用 npm run build" -ForegroundColor Yellow
        npm run build
    } else {
        pnpm build
    }
    Write-Host ">>> 前端构建完成，输出目录: frontend/dist" -ForegroundColor Green
} finally {
    Pop-Location
}
