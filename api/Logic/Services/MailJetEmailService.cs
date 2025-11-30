using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Logic.Dtos.Email;
using Logic.Dtos.Mailjet;
using Logic.Interfaces;
using Mailjet.Client;
using Mailjet.Client.Resources;
using Mailjet.Client.TransactionalEmails;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Logic.Services;

public partial class MailJetEmailService(
    IGlobalConfigService globalConfigService,
    ILogger<MailJetEmailService> logger) : IEmailService
{
    private async Task<IMailjetClient> MailJetClient()
    {
        var globalConfig = await globalConfigService.GetAllGlobalConfig();

        return new MailjetClient(globalConfig.MailjetApiKey, globalConfig.MailjetApiSecret);
    }
    
    public async Task SendEmailAsync(string from, string subject, string message, string?[] to, string?[]? cc = null, string?[]? bcc = null, (string filename, string contentType, Stream stream)[]? attachments = null, EmailEventPayload? payload = null)
    {
        if (!(await IsSenderRegistered(from)).Success)
        {
            logger.LogError("Sender {SenderFrom} is not registered with mailjet, cannot send an email", from);
            throw new Exception("Sender is not registered with mailjet, cannot send an email");
        }
        
        var client = await MailJetClient();

        cc ??= [];
        bcc ??= [];
        attachments ??= [];

        // remove empty ones
        to = to.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();
        cc = cc.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();
        bcc = bcc.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();

        logger.LogInformation("Sending email FROM={From}, TO={Recipients}, BCC={BCC}, CC={CC} with Subject={Subject}, Attachments={Attachments}",
            from,
            string.Join(", ", to),
            string.Join(", ", cc),
            string.Join(", ", bcc),
            subject,
            string.Join(", ", attachments.Select(x => x.filename)));

        // Construct your email with builder
        var builder = new TransactionalEmailBuilder()
            .WithFrom(new SendContact(from))
            .WithSubject(subject)
            .WithAttachments(await Task.WhenAll(attachments
                .Select(async x => new Attachment(x.filename, x.contentType, await ConvertToBase64(x.stream)))))
            .WithCc(cc.Select(x => new SendContact(x)))
            .WithTo(to.Select(x => new SendContact(x)))
            .WithBcc(bcc.Select(x => new SendContact(x)));

        var messageIsHtml = ContainsHtml(message);
        
        if (messageIsHtml)
        {
            builder.WithHtmlPart(message);
        }
        else
        {
            builder.WithTextPart(message);
        }

        if (payload != null)
        {
            builder.WithEventPayload(JsonConvert.SerializeObject(payload));
        }
         
        var email = builder.Build();

        // Invoke API to send email
        var response = await client.SendTransactionalEmailAsync(email);
                    
        // ReSharper disable once TemplateIsNotCompileTimeConstantProblem
        logger.LogInformation("Email sent successfully {Response}", response?.ToString());
    }

    public Task Callback(MailjetEvent[] body)
    {
        foreach (var mailjetEvent in body)
        {
            switch (mailjetEvent.Event)
            {
                case MailjetEventType.Sent:
                case MailjetEventType.Open:
                case MailjetEventType.Click:
                case MailjetEventType.Unsub:
                    // Okay events
                    break;
                case MailjetEventType.Bounce:
                case MailjetEventType.Blocked:
                case MailjetEventType.Spam:
                    EmailEventPayload? payload;
                    if (mailjetEvent.Payload != null && (payload = JsonConvert.DeserializeObject<EmailEventPayload>(mailjetEvent.Payload)) != null)
                    {
                        var reason = mailjetEvent.Event switch
                        {
                            MailjetEventType.Bounce => "bounced",
                            MailjetEventType.Blocked => "was blocked",
                            MailjetEventType.Spam => "was marked as spam",
                            _ => "failed"
                        };
                        
                        logger.LogWarning("Email Delivery Issue to={Email} reason={Reason} journeyId={JourneyId}", mailjetEvent.Email, reason, payload.JourneyId);
                    }
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        return Task.CompletedTask;
    }

    public async Task<string> GetFirstRegisteredEmail(params string?[] emails)
    {
        foreach (var email in emails)
        {
            if (!string.IsNullOrWhiteSpace(email) && (await IsSenderRegistered(email)).Success)
            {
                return email;
            }
        }
        
        logger.LogError("No email registered from these options={Options}", string.Join(", ", emails));
        
        throw new ArgumentException("No registered email found for sending messages."); 
    }

    public async Task<MailSenderRegistrationStatus> RegisterSender(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return new MailSenderRegistrationStatus
            {
                Success = false,
                Message = "Please provide an email address."
            };
        }
        
        var client = await MailJetClient();
        var request = new MailjetRequest
        {
            Resource = Sender.Resource
        }
        .Property(Sender.Email, email);
        var response = await client.PostAsync(request);

        if (response.IsSuccessStatusCode)
        {
            return new MailSenderRegistrationStatus
            {
                Success = false,
                Message = $"Successfully registered {email} to send emails"
            };
        }
        
        return new MailSenderRegistrationStatus
        {
            Success = true,
            Message = response.Content.GetValue("ErrorMessage")!.ToString(),
        };
    }

    public async Task<MailSenderRegistrationStatus> UnRegisterSender(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return new MailSenderRegistrationStatus
            {
                Success = false,
                Message = "Please provide an email address."
            };
        }
        
        var client = await MailJetClient();
        
        // First, get the sender ID by email
        var getSenderRequest = new MailjetRequest
        {
            Resource = Sender.Resource
        }
        .Filter(Sender.Email, email);
        
        var getSenderResponse = await client.GetAsync(getSenderRequest);
        
        if (!getSenderResponse.IsSuccessStatusCode || getSenderResponse.GetCount() == 0)
        {
            return new MailSenderRegistrationStatus
            {
                Success = false,
                Message = $"Sender with email {email} not found."
            };
        }
        
        // Get the sender data
        var senderData = getSenderResponse.GetData().FirstOrDefault();
        if (senderData == null)
        {
            return new MailSenderRegistrationStatus
            {
                Success = false,
                Message = $"Could not retrieve sender data for {email}."
            };
        }
        
        // Check current status
        var currentStatus = senderData["Status"]?.ToString();
        if (string.Equals(currentStatus, "Inactive", StringComparison.OrdinalIgnoreCase))
        {
            return new MailSenderRegistrationStatus
            {
                Success = true,
                Message = $"Email {email} is already unregistered from sending emails"
            };
        }
        
        var senderId = senderData["ID"]!.ToString();
        
        // Update sender status to inactive (this effectively unregisters it)
        var updateRequest = new MailjetRequest
        {
            Resource = Sender.Resource,
            ResourceId = ResourceId.Numeric(long.Parse(senderId))
        }
        .Property(Sender.Status, "Inactive");
        
        var updateResponse = await client.PutAsync(updateRequest);

        // Handle success cases
        if (updateResponse.IsSuccessStatusCode || updateResponse.StatusCode == (int)System.Net.HttpStatusCode.NotModified)
        {
            return new MailSenderRegistrationStatus
            {
                Success = true,
                Message = updateResponse.StatusCode == (int)System.Net.HttpStatusCode.NotModified 
                    ? $"Email {email} was already unregistered from sending emails"
                    : $"Successfully unregistered {email} from sending emails"
            };
        }

        var errorMessage = "Unknown error occurred during unregistration";
        try
        {
            var errorContent = updateResponse.GetErrorMessage();
            errorMessage = !string.IsNullOrEmpty(errorContent) ? errorContent : $"Request failed with status: {updateResponse.StatusCode}";
        }
        catch (Exception ex)
        {
            errorMessage = $"Failed to parse error response: {ex.Message}";
        }
        
        return new MailSenderRegistrationStatus
        {
            Success = false,
            Message = errorMessage
        };
    }
    
    public async Task<MailSenderRegistrationStatus> IsSenderRegistered(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return new MailSenderRegistrationStatus
            {
                Success = false,
                Message = $"Malformed email address {email}."
            };
        }
        
        var client = await MailJetClient();
        var request = new MailjetRequest
        {
            Resource = Sender.Resource
        }
        .Filter(Sender.Email, email);
        
        var response = await client.GetAsync(request);

        switch (response.IsSuccessStatusCode)
        {
            case true when response.GetTotal() > 0:
            {
                if (string.Equals(response.Content.SelectToken("Data")!.First!.Value<string>("Status"), "InActive", StringComparison.InvariantCultureIgnoreCase))
                {
                    return new MailSenderRegistrationStatus
                    {
                        Success = false,
                        Message = $"User {email} is registered to send email but inactive. Please check verification email from mailjet."
                    };
                }

                return new MailSenderRegistrationStatus
                {
                    Success = true,
                    Message = $"User {email} is registered and active to send emails."
                };
            }
            case true:
                return new MailSenderRegistrationStatus
                {
                    Success = false,
                    Message = $"User {email} is not registered to send emails."
                };
            default:
                return new MailSenderRegistrationStatus
                {
                    Success = false,
                    Message = $"Failed to get email sender registration status for {email}."
                };
        }
    }

    private static async Task<string> ConvertToBase64(Stream stream)
    {
        byte[] bytes;
        using (var memoryStream = new MemoryStream())
        {
            await stream.CopyToAsync(memoryStream);
            bytes = memoryStream.ToArray();
        }

        var base64 = Convert.ToBase64String(bytes);
        return base64;
    }

    private static bool ContainsHtml(string text)
    {
        return !string.IsNullOrWhiteSpace(text) && ContainsHtmlRegex().IsMatch(text);
    }

    [GeneratedRegex(@"<[^>]+>")]
    private static partial Regex ContainsHtmlRegex();
}
