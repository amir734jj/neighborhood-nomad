using System;
using Logic.Dtos.GlobalConfig;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Logic.JsonConverters;

public class GlobalConfigConverter(IHostEnvironment env) : JsonConverter<GlobalConfigModel>
{
    public override GlobalConfigModel ReadJson(JsonReader reader, Type objectType, GlobalConfigModel? existingValue, bool hasExistingValue, JsonSerializer serializer)
    {
        // First deserialize normally into a temporary object
        var temp = JObject.Load(reader);
        var model = new GlobalConfigModel(env);
        serializer.Populate(temp.CreateReader(), model);
        return model;
    }

    public override void WriteJson(JsonWriter writer, GlobalConfigModel? value, JsonSerializer serializer)
    {
        if (value is null)
        {
            writer.WriteNull();
            return;
        }
        serializer.Serialize(writer, value);
    }
}