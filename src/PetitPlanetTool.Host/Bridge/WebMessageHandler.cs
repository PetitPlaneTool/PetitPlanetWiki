using System.Text.Json;
using Microsoft.UI.Xaml.Controls;
using Microsoft.Web.WebView2.Core;
using PetitPlanetTool.Services;

namespace PetitPlanetTool.Bridge;

/// <summary>
/// 处理前端通过 postMessage 发送的消息，并调用对应本地服务后回传结果。
/// </summary>
public class WebMessageHandler
{
    private readonly CoreWebView2 _webView;
    private readonly ITelemetryService _telemetryService;
    private readonly LocalDataService _localDataService;

    /// <summary>
    /// 初始化消息处理器。
    /// </summary>
    /// <param name="webView">WinUI WebView2 控件实例</param>
    /// <param name="telemetryService">遥测服务</param>
    /// <param name="localDataService">本地数据服务</param>
    public WebMessageHandler(
        WebView2 webView,
        ITelemetryService telemetryService,
        LocalDataService localDataService)
    {
        _webView = webView.CoreWebView2;
        _telemetryService = telemetryService;
        _localDataService = localDataService;
    }

    /// <summary>解析并处理原始 JSON 消息</summary>
    public async void Handle(string? rawMessage)
    {
        if (string.IsNullOrWhiteSpace(rawMessage))
        {
            return;
        }

        try
        {
            using var document = JsonDocument.Parse(rawMessage);
            var root = document.RootElement;

            // 兼容两种消息格式：{ type, payload } 与 { id, action, params }
            if (root.TryGetProperty("type", out var typeElement))
            {
                await HandleTypedMessageAsync(typeElement.GetString(), root);
                return;
            }

            if (root.TryGetProperty("action", out var actionElement) &&
                root.TryGetProperty("id", out var idElement))
            {
                await HandleActionMessageAsync(
                    idElement.GetString() ?? string.Empty,
                    actionElement.GetString() ?? string.Empty,
                    root);
            }
        }
        catch (JsonException ex)
        {
            await SendScriptMessageAsync(new { type = "error", payload = new { message = ex.Message } });
        }
    }

    /// <summary>处理 { type, payload } 格式消息</summary>
    private async Task HandleTypedMessageAsync(string? type, JsonElement root)
    {
        switch (type)
        {
            case "telemetry":
                var record = _telemetryService.Collect();
                await SendScriptMessageAsync(new { type = "telemetry", payload = record });
                break;

            case "ping":
                await SendScriptMessageAsync(new { type = "pong", payload = new { timestamp = DateTime.Now } });
                break;

            default:
                await SendScriptMessageAsync(new
                {
                    type = "error",
                    payload = new { message = $"未知消息类型: {type}" }
                });
                break;
        }
    }

    /// <summary>处理 { id, action, params } 格式消息（兼容旧版前端桥接）</summary>
    private async Task HandleActionMessageAsync(string id, string action, JsonElement root)
    {
        object result = action switch
        {
            "getTelemetry" => _telemetryService.Collect(),
            "getMachineName" => new { machineName = Environment.MachineName },
            "ping" => new { ok = true, timestamp = DateTime.Now },
            _ => new { error = $"未知 action: {action}" }
        };

        var json = JsonSerializer.Serialize(result);
        // 通过 WebView2 消息通道回传，兼容前端 res:{id}: 回调协议
        _webView.PostWebMessageAsString($"res:{id}:{json}");
    }

    /// <summary>通过 WebView2 PostMessage 向前端推送结构化 JSON 消息</summary>
    private Task SendScriptMessageAsync(object message)
    {
        var json = JsonSerializer.Serialize(message);
        _webView.PostWebMessageAsString(json);
        return Task.CompletedTask;
    }
}
