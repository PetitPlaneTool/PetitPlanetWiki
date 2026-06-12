import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  // 使用相对路径，适配 WebView2 虚拟主机与本地文件加载
  base: './',
  plugins: [inspectAttr(), react()],
  clearScreen: false,
  server: {
    // 与 Host appsettings.Development.json 中 DevServerUrl 保持一致
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
