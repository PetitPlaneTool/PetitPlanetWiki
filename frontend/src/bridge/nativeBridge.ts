/**
 * WebView2 原生桥接层封装
 *
 * 提供前端与 C# 宿主之间的双向通信：
 * - postMessage / onMessage：JSON 消息通道
 * - invokeHostAsync：通过 hostObjects 直接调用 C# 方法
 */

/** 判断当前是否运行在 WebView2 环境中 */
const isInWebView = typeof window.chrome?.webview !== 'undefined'

/** 结构化消息体 */
export interface NativeMessage<T = unknown> {
  type: string
  payload?: T
}

/** HostObject 类型声明（由 C# NativeHostObject 暴露） */
interface NativeHostObject {
  GetMachineName: () => string
  GetSystemVersion: () => string
  GetTelemetryJson: () => string
}

declare global {
  interface Window {
    chrome?: {
      webview?: {
        postMessage: (message: string) => void
        addEventListener: (type: 'message', handler: (event: MessageEvent<string>) => void) => void
        removeEventListener: (type: 'message', handler: (event: MessageEvent<string>) => void) => void
        hostObjects: {
          native: NativeHostObject
        }
      }
    }
    /** C# 通过 PostMessage 推送消息时的全局回调（由 onMessage 注册） */
    __nativeBridgeReceive?: (data: NativeMessage) => void
  }
}

/**
 * 原生桥接 API
 */
export const nativeBridge = {
  /**
   * 向前端宿主发送 JSON 消息
   * @param type 消息类型，如 telemetry、ping
   * @param payload 可选载荷
   */
  postMessage: (type: string, payload?: unknown) => {
    const message = JSON.stringify({ type, payload } satisfies NativeMessage)
    if (isInWebView) {
      window.chrome!.webview!.postMessage(message)
    } else {
      console.log('[Mock Native]', type, payload)
    }
  },

  /**
   * 监听 C# 宿主推送的消息
   * @param callback 收到消息时的回调
   */
  onMessage: (callback: (data: NativeMessage) => void) => {
    if (!isInWebView) {
      return
    }

    window.__nativeBridgeReceive = callback

    window.chrome!.webview!.addEventListener('message', (event: MessageEvent<string>) => {
      const raw = event.data
      if (typeof raw === 'string' && raw.startsWith('res:')) {
        // 由 invokeNative（utils/native.ts）处理的请求-响应协议，此处跳过
        return
      }

      try {
        callback(JSON.parse(raw) as NativeMessage)
      } catch {
        callback({ type: 'raw', payload: raw })
      }
    })
  },

  /**
   * 通过 HostObject 异步调用 C# 方法
   * @param methodName C# 公开方法名
   * @param args 方法参数
   */
  invokeHostAsync: async <T = unknown>(methodName: keyof NativeHostObject): Promise<T> => {
    if (!isInWebView) {
      throw new Error('当前不在 WebView2 环境中，无法调用原生方法')
    }

    const hostObject = window.chrome!.webview!.hostObjects.native
    const result = await hostObject[methodName]()
    return result as T
  },

  /** 是否处于 WebView2 桌面壳环境 */
  isAvailable: () => isInWebView,
}
