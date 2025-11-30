using Newtonsoft.Json;

namespace Logic.Dtos.Email;

public class OpenEvent : MailjetEvent
{
    [JsonProperty("ip")]
    public string Ip { get; set; }
    
    [JsonProperty("geo")]
    public string Geo { get; set; }
    
    [JsonProperty("agent")]
    public string Agent { get; set; }
}