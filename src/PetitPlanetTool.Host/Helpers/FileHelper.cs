namespace PetitPlanetTool.Helpers;

/// <summary>
/// 文件系统辅助工具类。
/// </summary>
public static class FileHelper
{
    /// <summary>确保目录存在，不存在则创建</summary>
    public static void EnsureDirectoryExists(string path)
    {
        if (!Directory.Exists(path))
        {
            Directory.CreateDirectory(path);
        }
    }

    /// <summary>获取 Web 静态资源目录的绝对路径</summary>
    public static string GetWebAssetsPath(string relativeFolder)
    {
        return Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, relativeFolder));
    }
}
