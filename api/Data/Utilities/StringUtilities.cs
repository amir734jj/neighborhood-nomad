using CaseExtensions;

namespace Data.Utilities;

public static class StringUtilities
{
    public static string ToMemoryCacheKey<TClass>(params string[] keys) where TClass : class
    {
        return string.Join("_", new[] { typeof(TClass).Name }.Concat(keys).Select(x => x.ToKebabCase()));
    }
}