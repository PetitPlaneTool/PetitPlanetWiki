using System.Text.Json;
using PetitPlanetTool.Helpers;

namespace PetitPlanetTool.Services;

/// <summary>
/// 本地数据读写服务，用于持久化简单 JSON 数据。
/// </summary>
public class LocalDataService
{
    private readonly string _dataDirectory;

    /// <summary>
    /// 初始化本地数据目录。
    /// </summary>
    /// <param name="dataDirectory">数据存储根目录，默认为应用目录下的 data 文件夹</param>
    public LocalDataService(string? dataDirectory = null)
    {
        _dataDirectory = dataDirectory ?? Path.Combine(AppContext.BaseDirectory, "data");
        FileHelper.EnsureDirectoryExists(_dataDirectory);
    }

    /// <summary>读取 JSON 文件并反序列化为指定类型</summary>
    public async Task<T?> ReadJsonAsync<T>(string fileName, CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(_dataDirectory, fileName);
        if (!File.Exists(path))
        {
            return default;
        }

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<T>(stream, cancellationToken: cancellationToken);
    }

    /// <summary>将对象序列化为 JSON 并写入文件</summary>
    public async Task WriteJsonAsync<T>(string fileName, T data, CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(_dataDirectory, fileName);
        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, data, cancellationToken: cancellationToken);
    }
}
