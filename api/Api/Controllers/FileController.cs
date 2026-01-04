using System.Net;
using System.Web;
using Logic.Dtos.S3;
using Logic.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Constants;

namespace Api.Controllers;

[Authorize(Roles = RoleNameConstants.Admin)]
[Route("Api/[controller]")]
public class FileController(ISpaceService spaceService) : Controller
{
    [AllowAnonymous]
    [HttpPost]
    [Route("")]
    public async Task<IActionResult> Upload([FromForm] UploadFile uploadFile)
    {
        var key = Guid.NewGuid().ToString();
        var fixedFileName = HttpUtility.UrlDecode(uploadFile.File.FileName).Replace("\"", "");

        var response = await spaceService.Upload(
            key,
            fixedFileName,
            uploadFile.File.ContentType, 
            uploadFile.File.OpenReadStream(),
            new Dictionary<string, string>
            {
                [FileUploadConstants.Description] = uploadFile.Description ?? "photo attachment",
            });

        if (response.Status == HttpStatusCode.OK)
        {
            return Ok(key);
        }

        return BadRequest(response);
    }

    [AllowAnonymous]
    [HttpGet]
    [Route("{id:guid}")]
    public async Task<IActionResult> Download([FromRoute] Guid id)
    {
        var response = await spaceService.Download(id.ToString());

        if (response.Status == HttpStatusCode.OK)
        {
            return File(response.Data!, response!.ContentType!, response.Name);
        }

        return NotFound(response);
    }
    
    [HttpDelete]
    [Route("{id:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var response = await spaceService.Delete(id.ToString());

        if (response.Status == HttpStatusCode.OK)
        {
            return Ok("Successfully deleted");
        }

        return NotFound(response);
    }

    [HttpGet]
    [Route("")]
    public async Task<IActionResult> List([FromQuery] bool includeMetadata = false)
    {
        if (includeMetadata)
        {
            var response = await spaceService.ListWithMetadata();

            return Ok(response);
        }
        else
        {
            var response = await spaceService.List();

            return Ok(response);
        }
    }
}