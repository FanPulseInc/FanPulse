namespace FanPulseApi.Validators
{
    public interface ISpecification<T>
    {
        bool IsSatisfiedBy(T entity);
    }
}
