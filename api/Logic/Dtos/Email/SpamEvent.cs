using Newtonsoft.Json;

namespace Logic.Dtos.Email;

public class SpamEvent : MailjetEvent
{
    [JsonProperty("source")]
    public string Source { get; set; }
}