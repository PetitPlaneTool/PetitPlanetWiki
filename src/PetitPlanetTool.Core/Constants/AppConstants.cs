namespace PetitPlanetTool.Core.Constants;

/// <summary>
/// 应用级常量定义，供 Host 与其他模块共享。
/// </summary>
public static class AppConstants
{
    /// <summary>应用显示名称</summary>
    public const string ProductName = "星布谷地Wiki";

    /// <summary>应用版本号</summary>
    public const string Version = "0.1.9";

    /// <summary>开发者 / 发行方</summary>
    public const string Publisher = "露米工作室";

    /// <summary>WebView2 虚拟主机域名（生产模式加载本地静态资源）</summary>
    public const string VirtualHostName = "app.local";

    /// <summary>前端静态资源相对目录</summary>
    public const string WebAssetsFolder = "Assets/Web";

    /// <summary>Vite 开发服务器默认地址</summary>
    public const string DevServerUrl = "http://localhost:3000";
}
