using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Abstracts;
using Api.Attributes;
using Api.Configs;
using Logic.Dtos.Account;
using Logic.Dtos.Error;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Models.Entities;

namespace Api.Controllers;

[Route("api/[controller]")]
public class AccountController(
    JwtSettings jwtSettings,
    UserManager<User> userManager,
    RoleManager<Role> roleManager,
    SignInManager<User> signManager,
    IUserService userService)
    : IdentityController
{
    [AllowAnonymous]
    [HttpGet]
    [Route("IsAuthenticated")]
    public IActionResult IsAuthenticated()
    {
        return Ok(User.Identity!.IsAuthenticated.ToString().ToLower());
    }

    [DisallowAuthorized]
    [HttpPost]
    [Route("Register")]
    public async Task<IActionResult> Register([FromBody] RegisterViewModel registerViewModel)
    {
        var anyUser = await userManager.Users.AnyAsync(); // first user to register is enabled
        var admin = await roleManager.FindByNameAsync("admin");

        var user = new User
        {
            Email = registerViewModel.Email,
            UserName = registerViewModel.Username,
            Enabled = !anyUser,
            LastLoginDate = null,   // user has not logged-in yet
        };

        // Create user
        var identityResults = new List<IdentityResult>
        {
            await userManager.CreateAsync(user, registerViewModel.Password),
        };

        // Register the user to the role
        if (!anyUser)
        {
            if (admin == null)
            {
                await roleManager.CreateAsync(new Role("admin"));
                
                admin = await roleManager.FindByNameAsync("admin");
            }
            
            identityResults.Add(await userManager.AddToRoleAsync(user, admin!.Name!));
        }

        if (identityResults.All(x => x.Succeeded))
        {
            return Ok("Successfully registered!");
        }

        return BadRequest(new ErrorViewModel(new[] { "Failed to register!" }
            .Concat(identityResults.SelectMany(x => x.Errors.Select(y => y.Description))).ToArray()));
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("Login")]
    public async Task<IActionResult> Login([FromBody] LoginViewModel loginViewModel)
    {
        // Ensure the username and password is valid.
        var user = await userManager.FindByNameAsync(loginViewModel.Username);

        if (user == null || !await userManager.CheckPasswordAsync(user, loginViewModel.Password))
        {
            return BadRequest(new ErrorViewModel("The username or password is invalid."));
        }

        if (!user.Enabled)
        {
            return BadRequest(new ErrorViewModel("Account is not enabled."));
        }
        
        var userRoles = await userManager.GetRolesAsync(user);
        if (!userRoles.Any())
        {
            return BadRequest(new ErrorViewModel("User does not have any assigned roles."));
        }

        await signManager.SignInAsync(user, true);

        // Set LastLoginTime
        await userService.UpdateUserLastLoginDate(user, DateTimeOffset.UtcNow);

        var token = ResolveToken(user);

        return Ok(token);
    }

    [Authorize]
    [HttpPost]
    [Route("Logout")]
    public async Task<IActionResult> Logout()
    {
        await signManager.SignOutAsync();

        return Ok("Logged-Out");
    }

    [Authorize]
    [HttpPost]
    [Route("Refresh")]
    public async Task<IActionResult> Refresh()
    {
        var user = await GetCurrentUser();

        var token = ResolveToken(user!);

        return Ok(token);
    }

    [Authorize]
    [HttpPost]
    [Route("ResetPassword/Adhoc")]
    public async Task<IActionResult> PasswordResetAdhoc([FromBody]PasswordResetAdhocViewModel request)
    {
        var currentUser = await GetCurrentUser();

        if (currentUser!.UserName != request.Username && !(await userManager.GetRolesAsync(currentUser)).Contains("SuperAdmin"))
        {
            return BadRequest(new ErrorViewModel("Cannot change password for someone other than yourself."));
        }
        
        var user = await userService.GetUserByEmailUsername(request.Email, request.Username);

        if (user == null)
        {
            return BadRequest("Invalid email/username combination");
        }

        var identity = await userManager.FindByIdAsync(user.Id.ToString());
        var token = await userManager.GeneratePasswordResetTokenAsync(identity!);
        var resetPassword = await userManager.ResetPasswordAsync(identity!, token, request.Password);

        if (!resetPassword.Succeeded)
        {
            return BadRequest(new ErrorViewModel(new[] { "Failed to reset password." }
                .Concat(resetPassword.Errors.Select(x => x.Description)).ToArray()));
        }
        
        await userService.PasswordResetSubmit(user);

        return Ok("Successfully accepted password reset request");
    }

    [AllowAnonymous]
    [HttpPost]
    [Route("ResetPassword/Request")]
    public async Task<IActionResult> PasswordResetRequest([FromBody]PasswordResetRequestViewModel request)
    {
        var user = await userService.GetUserByEmailUsername(request.Email, request.Username);

        if (user == null)
        {
            return BadRequest("Invalid email/username combination");
        }

        var identity = await userManager.FindByIdAsync(user.Id.ToString());
        var token = await userManager.GeneratePasswordResetTokenAsync(identity!);

        await userService.PasswordResetRequest(user, token);

        return Ok("Successfully accepted password reset request");
    }
    
    [AllowAnonymous]
    [HttpPost]
    [Route("ResetPassword/Submit")]
    public async Task<IActionResult> PasswordReset([FromBody]PasswordResetViewModel request)
    {
        var user = await userService.GetUserByEmailUsername(request.Email, request.Username);

        if (user == null)
        {
            return BadRequest("Invalid email/username combination");
        }
        
        var isResetTokenValid = await userManager.VerifyUserTokenAsync(user, TokenOptions.DefaultProvider, "ResetPassword", request.Token);
            
        if (!isResetTokenValid)
        {
            return BadRequest("Password Reset link is not valid!");
        }
        
        var identity = await userManager.FindByIdAsync(user.Id.ToString());
        var resetPassword = await userManager.ResetPasswordAsync(identity!, request.Token, request.Password);

        if (!resetPassword.Succeeded)
        {
            return BadRequest(new ErrorViewModel(new[] { "Failed to reset password." }
                .Concat(resetPassword.Errors.Select(x => x.Description)).ToArray()));
        }
        
        await userService.PasswordResetSubmit(user);

        return Ok("Successfully reset password");
    }

    private string ResolveToken(User user)
    {
        // Generate and issue a JWT token
        var claims = new[]
        {
            new Claim(ClaimTypes.Version, user.Enabled.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.UserName!), // use UserName as username
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Sub, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expires = DateTimeOffset.UtcNow.AddMinutes(jwtSettings.AccessTokenDurationInMinutes);

        var token = new JwtSecurityToken(
            jwtSettings.Issuer,
            jwtSettings.Issuer,
            claims,
            expires: expires.DateTime,
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
