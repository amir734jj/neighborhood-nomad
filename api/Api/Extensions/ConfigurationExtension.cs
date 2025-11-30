namespace Api.Extensions;

public static class ConfigurationExtension
{
    extension(IConfiguration configuration)
    {
        public T GetRequiredValue<T>(string key)
            where T : class
        {
            return configuration.GetValue<T>(key) ?? throw new Exception($"Failed to get configuration for: {key} and type: {typeof(T).Name}");
        }

        public T GetRequiredValue<T>()
            where T : class
        {
            return configuration.Get<T>() ?? throw new Exception($"Failed to get configuration and type: {typeof(T).Name}");
        }
    }
}