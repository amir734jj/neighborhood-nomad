using Newtonsoft.Json;

namespace Logic.Dtos.Email;

public class ClickEvent : OpenEvent
{
    [JsonProperty("url")]
    public string Url { get; set; }
}