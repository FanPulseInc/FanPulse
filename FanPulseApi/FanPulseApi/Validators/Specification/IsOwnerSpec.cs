using FanPulseApi.DTO;

namespace FanPulseApi.Validators
{
    public class IsOwnerSpec : ISpecification<OwnerCheckRequest>
    {
        public bool IsSatisfiedBy(OwnerCheckRequest entity)
        {
            return entity.FromRequest == entity.FromToken;
        }
    }
}
