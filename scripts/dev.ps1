# 本地开发启动脚本：同时提示启动前端与 WinUI 宿主
# 用法: .\scripts\dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host @"

PetitPlanetTool 开发模式
========================
1. 请在当前终端运行前端开发服务器:
   cd frontend && pnpm dev

2. 在 Visual Studio 2022 中以 Debug 模式启动:
   src/PetitPlanetTool.Host

WebView2 将自动加载 http://localhost:3000 并打开 DevTools。

"@ -ForegroundColor Cyan

$FrontendDir = Join-Path $Root "frontend"
Push-Location $FrontendDir
try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm dev
    } else {
        npm run dev
    }
} finally {
    Pop-Location
}
