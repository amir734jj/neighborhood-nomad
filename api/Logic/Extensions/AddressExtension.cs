using System.Text;
using Logic.Dtos.Board;

namespace Logic.Extensions;

public static class AddressExtension
{
    // W315N7755 WI-83, Hartland, WI 53029 USA
    public static string GetAddressSingleLine(this AddressDto? address, bool includeCountry)
    {
        // not a valid address
        if (address == null || string.IsNullOrEmpty(address.AddressLine1)) return string.Empty;
        
        var sb = new StringBuilder();
        
        sb.Append(address.Name);

        sb.Append(address?.AddressLine1.Trim());
        
        if (!string.IsNullOrEmpty(address?.AddressLine2))
        {
            sb.Append(' ').Append(address?.AddressLine2.Trim());
        }

        sb.Append(", ");
        
        sb.Append(address?.City!.Trim());
        sb.Append(", ").Append(address?.State).Append(' ');
        sb.Append(address?.ZipCode).Append(' ');
        
        if (!includeCountry)
        {
            return sb.ToString();
        }

        sb.Append("USA");
        return sb.ToString();
    }
}