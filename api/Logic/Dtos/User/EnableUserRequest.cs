namespace Logic.Dtos.User;

public class EnableUserRequest
{
    public int UserId { get; set; }
    
    public bool Enabled { get; set; }
}