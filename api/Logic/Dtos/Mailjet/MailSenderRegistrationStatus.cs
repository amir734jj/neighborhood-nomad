namespace Logic.Dtos.Mailjet;

public class MailSenderRegistrationStatus
{
    public required bool Success { get; set; }
    
    public required string Message { get; set; }
}