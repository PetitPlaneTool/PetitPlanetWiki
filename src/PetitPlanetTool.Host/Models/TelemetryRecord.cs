namespace PetitPlanetTool.Models;

/// <summary>
/// 本地遥测采集记录，包含 CPU 与内存使用情况。
/// </summary>
public class TelemetryRecord
{
    /// <summary>CPU 使用率（百分比）</summary>
    public double CpuUsage { get; set; }

    /// <summary>当前进程内存占用（MB）</summary>
    public double MemoryUsageMB { get; set; }

    /// <summary>采集时间戳</summary>
    public DateTime Timestamp { get; set; }
}
