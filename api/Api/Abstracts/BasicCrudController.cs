using System.Collections;
using Logic.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models.Interfaces;

namespace Api.Abstracts;

public abstract class BasicCrudController<T> : Controller
    where T : class, IEntity
{
    [NonAction]
    protected abstract IBasicCrudLogic<T> BasicCrudLogic();

    [HttpGet]
    [Route("")]
    [ProducesResponseType(typeof(IEnumerable), 200)]
    public virtual async Task<IActionResult> GetAll()
    {
        return Ok(await BasicCrudLogic().GetAll());
    }
    
    [HttpGet]
    [Route("{id:guid}/deletable")]
    public virtual async Task<IActionResult> CanBeDeleted([FromRoute] Guid id)
    {
        return Ok(await BasicCrudLogic().CanBeDeleted(id));
    }

    [HttpGet]
    [Route("{id:guid}")]
    public virtual async Task<IActionResult> Get([FromRoute] Guid id)
    {
        var result = await BasicCrudLogic().Get(id);

        if (result == null)
        {
            return NotFound($"Failed to find entity {id}");
        }
        
        return Ok(result);
    }

    [HttpPut]
    [Route("{id:guid}")]
    public virtual async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] T instance)
    {
        return Ok(await BasicCrudLogic().Update(id, instance));
    }

    [HttpDelete]
    [Route("{id:guid}")]
    public virtual async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        return Ok(await BasicCrudLogic().Delete(id));
    }

    [HttpPost]
    [Route("")]
    public virtual async Task<IActionResult> Save([FromBody] T instance)
    {
        return Ok(await BasicCrudLogic().Save(instance));
    }

    [HttpGet]
    [Route("filtered")]
    public async Task<IActionResult> GetAllFiltered([FromQuery] Guid[] ids)
    {
        return Ok(await BasicCrudLogic().GetAllFiltered(ids));
    }
}