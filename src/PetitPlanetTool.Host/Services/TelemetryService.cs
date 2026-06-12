using System.Diagnostics;
using PetitPlanetTool.Models;

namespace PetitPlanetTool.Services;

/// <summary>
/// 基于 PerformanceCounter 的遥测采集实现。
/// </summary>
public class TelemetryService : ITelemetryService, IDisposable
{
    private readonly PerformanceCounter _cpuCounter;

    /// <summary>初始化 CPU 性能计数器</summary>
    public TelemetryService()
    {
        _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
        // 首次调用 NextValue 返回 0，需预热
        _ = _cpuCounter.NextValue();
    }

    /// <inheritdoc />
    public TelemetryRecord Collect()
    {
        var process = Process.GetCurrentProcess();
        return new TelemetryRecord
        {
            CpuUsage = Math.Round(_cpuCounter.NextValue(), 2),
            MemoryUsageMB = Math.Round(process.WorkingSet64 / 1024.0 / 1024.0, 2),
            Timestamp = DateTime.Now
        };
    }

    /// <summary>释放性能计数器资源</summary>
    public void Dispose()
    {
        _cpuCounter.Dispose();
    }
}
