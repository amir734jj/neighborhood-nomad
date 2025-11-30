using System.Collections.Generic;
using System.Linq;

namespace Logic.Dtos.Error;

public class ErrorViewModel(params string[] errors)
{
    public List<string> Errors { get; } = errors.ToList();
}