using EfCoreRepository;
using Models.Entities;

namespace Data.Profiles
{
    public class AddressEntity : EntityProfile<Address>
    {
        public AddressEntity()
        {
            Map(x => x.Name);
            Map(x => x.AddressLine1);
            Map(x => x.AddressLine2);
            Map(x => x.City);
            Map(x => x.State);
            Map(x => x.ZipCode);
            Map(x => x.Latitude);
            Map(x => x.Longitude);
        }
    }
}