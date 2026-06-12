using Microsoft.Extensions.Configuration;

namespace PetitPlanetTool.Helpers;

/// <summary>
/// 应用配置读取辅助类，封装 appsettings.json 访问。
/// </summary>
public static class AppConfiguration
{
    private static IConfiguration? _configuration;

    /// <summary>全局配置实例</summary>
    public static IConfiguration Configuration =>
        _configuration ?? throw new InvalidOperationException("配置尚未初始化，请先调用 Build。");

    /// <summary>
    /// 构建配置：加载 appsettings.json，开发环境额外加载 Development 覆盖项。
    /// </summary>
    public static IConfiguration Build()
    {
        var builder = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

#if DEBUG
        builder.AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true);
#endif

        _configuration = builder.Build();
        return _configuration;
    }

    /// <summary>获取 WebView2 虚拟主机名</summary>
    public static string GetVirtualHostName() =>
        Configuration["WebView2:VirtualHostName"] ?? "app.local";

    /// <summary>获取前端静态资源文件夹相对路径</summary>
    public static string GetAssetsFolder() =>
        Configuration["WebView2:AssetsFolder"] ?? "Assets/Web";

    /// <summary>获取 Vite 开发服务器地址</summary>
    public static string GetDevServerUrl() =>
        Configuration["WebView2:DevServerUrl"] ?? "http://localhost:3000";
}
