/**
 * 兼容旧版请求-响应协议的 native 调用封装
 * 新代码请优先使用 bridge/nativeBridge.ts
 */
import { nativeBridge } from '@/bridge/nativeBridge'

interface BridgeMessage {
  id: string
  action: string
  params?: unknown
}

/**
 * 通过 postMessage 向 C# 发送 action 请求并等待响应
 * @param action 操作名称，如 getTelemetry
 * @param params 可选参数
 */
export function invokeNative(action: string, params?: unknown): Promise<unknown> {
  return new Promise((resolve) => {
    const webview = window.chrome?.webview
    if (!webview) {
      resolve({ error: 'native_bridge_unavailable' })
      return
    }

    const id = Date.now().toString() + Math.random().toString(36).substring(2)
    const handler = (e: MessageEvent<string>) => {
      if (typeof e.data === 'string' && e.data.startsWith(`res:${id}:`)) {
        const result = e.data.substring(`res:${id}:`.length)
        webview.removeEventListener('message', handler)
        try {
          resolve(JSON.parse(result))
        } catch {
          resolve(result)
        }
      }
    }

    webview.addEventListener('message', handler)
    const message: BridgeMessage = { id, action, params }
    webview.postMessage(JSON.stringify(message))
  })
}

/** 重新导出新版桥接 API */
export { nativeBridge }
