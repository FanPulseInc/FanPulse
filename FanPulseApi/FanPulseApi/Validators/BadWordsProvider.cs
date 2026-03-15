
namespace FanPulseApi.Validators
{
    public class BadWordsProvider : IBadWordsProvider
    {

        private readonly HashSet<string> _badWods;

        public BadWordsProvider()
        {
            string fileName = "badwords.txt";
            string fullPath = Path.Combine(AppContext.BaseDirectory, fileName);
            var words = File.ReadAllLines(fullPath);
            _badWods = new HashSet<string>(words, StringComparer.OrdinalIgnoreCase);

        }
        


        public IReadOnlySet<string> GetBadWords()
        {
          return _badWods;
        }
    }
}
