using System;
using Microsoft.Extensions.DependencyInjection;

namespace Logic.Utility;

public class LazyService<T>(IServiceProvider provider) : Lazy<T>(provider.GetRequiredService<T>) where T : class;