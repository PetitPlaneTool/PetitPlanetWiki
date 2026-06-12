using PetitPlanetTool.Models;

namespace PetitPlanetTool.Services;

/// <summary>
/// 本地遥测服务接口，用于采集系统性能指标。
/// </summary>
public interface ITelemetryService
{
    /// <summary>采集一次遥测数据</summary>
    TelemetryRecord Collect();
}
