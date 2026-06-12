using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI.Xaml;
using Microsoft.Web.WebView2.Core;
using PetitPlanetTool.Bridge;
using PetitPlanetTool.Helpers;
using PetitPlanetTool.Services;

namespace PetitPlanetTool;

/// <summary>
/// 应用主窗口：初始化 WebView2 并加载 React 前端（开发/生产双模式）。
/// </summary>
public sealed partial class MainWindow : Window
{
    private WebMessageHandler? _messageHandler;
    private bool _webViewInitialized;

    /// <summary>创建主窗口并在首次激活时初始化 WebView2</summary>
    public MainWindow()
    {
        InitializeComponent();
        Activated += MainWindow_Activated;
    }

    /// <summary>窗口首次激活时初始化 WebView2（WinUI Window 无 Loaded 事件）</summary>
    private async void MainWindow_Activated(object sender, WindowActivatedEventArgs args)
    {
        if (_webViewInitialized)
        {
            return;
        }

        _webViewInitialized = true;
        Activated -= MainWindow_Activated;
        await InitializeWebViewAsync();
    }

    /// <summary>
    /// 初始化 WebView2 环境、桥接层与前端页面导航。
    /// Debug 模式连接 Vite 开发服务器；Release 模式通过虚拟主机加载本地静态文件。
    /// </summary>
    private async Task InitializeWebViewAsync()
    {
        await MainWebView.EnsureCoreWebView2Async();

        var telemetryService = App.Services.GetRequiredService<ITelemetryService>();
        var localDataService = App.Services.GetRequiredService<LocalDataService>();

        // 注册 HostObject，供前端 hostObjects.native 同步/异步调用
        var hostObject = new NativeHostObject(telemetryService);
        MainWebView.CoreWebView2.AddHostObjectToScript("native", hostObject);

        // 注册 postMessage 消息接收
        _messageHandler = new WebMessageHandler(MainWebView, telemetryService, localDataService);
        MainWebView.CoreWebView2.WebMessageReceived += (_, args) =>
        {
            _messageHandler.Handle(args.TryGetWebMessageAsString());
        };

#if DEBUG
        // 开发模式：加载 Vite 开发服务器（支持 HMR 热更新）
        var devUrl = AppConfiguration.GetDevServerUrl();
        MainWebView.CoreWebView2.Navigate(devUrl);
        // 打开 DevTools 方便调试前端
        MainWebView.CoreWebView2.OpenDevToolsWindow();
#else
        // 生产模式：虚拟主机映射本地 Assets/Web 目录
        var virtualHost = AppConfiguration.GetVirtualHostName();
        var assetsFolder = FileHelper.GetWebAssetsPath(AppConfiguration.GetAssetsFolder());

        MainWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            virtualHost,
            assetsFolder,
            CoreWebView2HostResourceAccessKind.Allow);

        MainWebView.CoreWebView2.Navigate($"https://{virtualHost}/index.html");
#endif
    }
}
