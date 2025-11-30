using Microsoft.AspNetCore.Mvc;

namespace Api.Attributes;

public class DisallowAuthorizedAttribute() : TypeFilterAttribute(typeof(DisallowAuthorizedFilter));