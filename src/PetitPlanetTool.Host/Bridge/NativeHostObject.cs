using System.Runtime.InteropServices;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using PetitPlanetTool.Services;

namespace PetitPlanetTool.Bridge;

/// <summary>
/// 暴露给 JavaScript 的原生宿主对象，支持通过 hostObjects.native 直接调用。
/// </summary>
[ComVisible(true)]
public class NativeHostObject
{
    private readonly ITelemetryService _telemetryService;

    public NativeHostObject(ITelemetryService telemetryService)
    {
        _telemetryService = telemetryService;
    }

    /// <summary>获取本机计算机名</summary>
    public string GetMachineName() => Environment.MachineName;

    /// <summary>获取操作系统版本信息</summary>
    public string GetSystemVersion() => Environment.OSVersion.ToString();

    /// <summary>采集一次遥测数据并以 JSON 字符串返回</summary>
    public string GetTelemetryJson()
    {
        var record = _telemetryService.Collect();
        return JsonSerializer.Serialize(record);
    }
}
