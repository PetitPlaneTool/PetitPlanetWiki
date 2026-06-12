using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI.Xaml;
using PetitPlanetTool.Helpers;
using PetitPlanetTool.Services;

namespace PetitPlanetTool;

/// <summary>
/// WinUI 3 应用程序入口，负责 DI 容器初始化与主窗口启动。
/// </summary>
public partial class App : Application
{
    private Window? _window;

    /// <summary>全局依赖注入服务提供者</summary>
    public static IServiceProvider Services { get; private set; } = null!;

    /// <summary>应用构造函数：加载配置并构建 DI 容器</summary>
    public App()
    {
        InitializeComponent();
        ConfigureServices();
    }

    /// <summary>应用启动时创建并激活主窗口</summary>
    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        _window = new MainWindow();
        _window.Activate();
    }

    /// <summary>注册所有本地服务到 DI 容器</summary>
    private static void ConfigureServices()
    {
        // 加载 appsettings.json（开发环境自动合并 Development 覆盖项）
        AppConfiguration.Build();

        var services = new ServiceCollection();
        services.AddSingleton<ITelemetryService, TelemetryService>();
        services.AddSingleton<LocalDataService>();

        Services = services.BuildServiceProvider();
    }
}
