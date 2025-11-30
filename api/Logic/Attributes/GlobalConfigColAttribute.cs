using System;

namespace Logic.Attributes;

[AttributeUsage(AttributeTargets.Property)]
public class GlobalConfigColAttribute : Attribute
{
    public required string Name { get; set; }

    public bool Public { get; set; }

    public bool ReadOnly { get; set; }
}