using Api.Abstracts;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Constants;
using Models.Entities;

namespace Api.Controllers;

[Authorize(Roles = RoleNameConstants.Admin)]
[Route("api/[controller]")]
public class AddressController(IAddressService addressService) : BasicCrudController<Address>
{
    protected override IBasicCrudLogic<Address> BasicCrudLogic()
    {
        return addressService;
    }
}