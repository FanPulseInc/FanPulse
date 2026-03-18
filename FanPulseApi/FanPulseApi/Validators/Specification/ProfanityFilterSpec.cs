using FanPulseApi.Validators.Specification;
using Microsoft.EntityFrameworkCore.Storage.Json;
using Microsoft.OpenApi.Validations;

namespace FanPulseApi.Validators
{
    public class ProfanityFilterSpec : ISpecification<string>
    {
        private readonly IBadWordsProvider _badWordsProvider;

        public ProfanityFilterSpec(IBadWordsProvider badWordsProvider)
        {
            _badWordsProvider = badWordsProvider;
        }

        public bool IsSatisfiedBy(string entity)
        {
            var badWords = _badWordsProvider.GetBadWords();

            string[] words = entity.Split(
             new[] { ' ', ',', '.', '!', '?', ';', ':', '\t', '\n', '\r' },
             StringSplitOptions.RemoveEmptyEntries );

            return words.Any((w) => badWords.Contains(w.ToLower()));


        }
    }
}
