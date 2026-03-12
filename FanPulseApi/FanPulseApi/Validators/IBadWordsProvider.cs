namespace FanPulseApi.Validators
{
    public interface IBadWordsProvider
    {
        public IReadOnlySet<string> GetBadWords();

    }
}
