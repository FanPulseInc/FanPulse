namespace FanPulseApi.Validators.Specification
{
    public interface ISpecification<T>
    {
        bool IsSatisfiedBy(T entity);
    }
}
