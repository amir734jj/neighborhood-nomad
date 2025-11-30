using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using CaseExtensions;
using EfCoreRepository.Interfaces;
using Logic.Attributes;
using Logic.Dtos.GlobalConfig;
using Logic.Interfaces;
using Microsoft.Extensions.Hosting;
using Models.Entities;

namespace Logic.Services;

public class GlobalConfigService(IEfRepository repository, IHostEnvironment hostEnvironment) : IGlobalConfigService
{
    private readonly IBasicCrud<GlobalConfig> _crud = repository.For<GlobalConfig>();

    private static string GetColumnName(PropertyInfo property)
    {
        return property.GetCustomAttribute<GlobalConfigColAttribute>()?.Name ?? throw new NullReferenceException($"Column name is null for {property.Name}");
    }
    
    private static bool IsColumnPublic(PropertyInfo property)
    {
        return property.GetCustomAttribute<GlobalConfigColAttribute>()?.Public ?? throw new NullReferenceException($"Column private is null for {property.Name}");
    }
    
    private static bool IsReadonly(PropertyInfo property)
    {
        return property.GetCustomAttribute<GlobalConfigColAttribute>()?.ReadOnly ?? throw new NullReferenceException($"Column readonly is null for {property.Name}");
    }
    
    public async Task<GlobalConfigModel> GetAllGlobalConfig()
    {
        var (model, _) = await GetGlobalConfigHelper(publicOnly: false);
        
        return model;
    }

    public async Task UpdateGlobalConfig(GlobalConfigModel config)
    {
        var rows = (await _crud.GetAll()).ToList();

        foreach (var x in typeof(GlobalConfigModel).GetProperties())
        {
            if (IsReadonly(x))
            {
                continue;
            }
            
            var columnName = GetColumnName(x);
            var rawValue = x.GetValue(config)?.ToString() ?? string.Empty;

            var row = rows.FirstOrDefault(y => y.Key == columnName);

            if (row != null)
            {
                await _crud.Update(row.Id, y =>
                {
                    y.Value = rawValue; 
                });
            }
            else
            {
                await _crud.Save(new GlobalConfig
                {
                    Key = columnName,
                    Value = rawValue
                });
            }
        }
    }

    public async Task<Dictionary<string, object>> GetPublicGlobalConfig()
    {
        var (_, dictionary) = await GetGlobalConfigHelper(publicOnly: true);
        return dictionary.ToDictionary(x => x.Key.ToCamelCase(), x => x.Value);
    }

    private async Task<(GlobalConfigModel model, Dictionary<string, object> dictionary)> GetGlobalConfigHelper(bool publicOnly)
    {
        var rows = (await _crud.GetAll()).ToDictionary(row => row.Key, row => row.Value);
        var instance = new GlobalConfigModel(hostEnvironment);
        var globalConfig = new Dictionary<string, object>();

        foreach (var property in typeof(GlobalConfigModel).GetProperties())
        {
            var columnName = GetColumnName(property);

            if (publicOnly && !IsColumnPublic(property))
            {
                continue;
            }

            if (rows.TryGetValue(columnName, out var value))
            {
                var typedValue = ConvertValue(property.PropertyType, value);
                globalConfig[property.Name] = typedValue!;
                property.SetValue(instance, typedValue);
            }
            else if (IsReadonly(property))
            {
                globalConfig[property.Name] = property.GetValue(instance)!;
            }
        }

        return (instance, globalConfig);
    }

    private static object ConvertValue(Type targetType, string value)
    {
        if (targetType == typeof(string))
        {
            return value;
        }

        if (targetType == typeof(int))
        {
            return int.Parse(value);
        }

        if (targetType == typeof(Uri))
        {
            return new Uri(value);
        }

        return targetType == typeof(bool) ? bool.Parse(value) : throw new Exception($"Unsupported type {targetType.Name}");
    }
}