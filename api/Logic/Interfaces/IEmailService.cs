using System.IO;
using System.Threading.Tasks;
using Logic.Dtos.Email;
using Logic.Dtos.Mailjet;

namespace Logic.Interfaces;

public interface IEmailService
{
    Task<string> GetFirstRegisteredEmail(params string?[] emails);
    
    Task<MailSenderRegistrationStatus> RegisterSender(string email);

    Task<MailSenderRegistrationStatus> UnRegisterSender(string email);
    
    Task<MailSenderRegistrationStatus> IsSenderRegistered(string email);
    
    Task SendEmailAsync(string from, string subject, string message, string?[] to, string?[]? cc = null, string?[]? bcc = null, (string filename, string contentType, Stream stream)[]? attachments = null, EmailEventPayload? payload = null);
    
    Task Callback(MailjetEvent[] body);
}
