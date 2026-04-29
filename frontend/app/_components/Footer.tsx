const sportItems = [
  "Футбол",
  "Баскетбол",
  "Американський футбол",
  "Теніс",
  "Мотоспорт",
];
const esportItems = ["League of Legends", "Counter Strike", "Dota 2"];
const forumItems = [
  "Контакти",
  "Політика приватності",
  "Політика Cookies",
  "Політика доступності",
  "Реклама",
];

const Footer = () => {
  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-11 bg-[color:var(--variable-collection-4-white)] px-4 sm:px-6 lg:px-[45px] py-6">
      <div className="w-full lg:w-[653px] flex-col items-start gap-2.5 p-4 sm:p-2.5 bg-variable-collection-4-white-duplicate rounded-[20px] lg:rounded-[30px] opacity-80 flex">
        <div className="flex-col w-full items-start justify-center gap-1 flex">
          <div className="text-[length:var(--l-interface-font-size)] flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            Інформація
          </div>
        </div>

        <div className="flex-col w-full items-start gap-1 flex">
          <p className="self-stretch [font-family:'Inter-Medium',Helvetica] font-medium text-[#212121] text-xs tracking-[0] leading-5">
            FanPulse.com пропонує результати, рахунок та підсумкові таблиці
            матчів у спорті та кіберспорті. Слідкуйте за своїми улюбленими
            командами прямо зараз! Обговорюйте результати відразу на форумі не
            виходячи із сайту. Результати на FanPulse.com оновлюються
            автоматично, і вам не потрібно оновлювати їх вручну. Додавши матчі,
            за якими ви хочете стежити, до улюблених, ви будете в курсі
            результатів усіх матчів та всієї статистики. Це унікальний сайт, що
            поєднує статистику спорту, кіберспорту і форум.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[653px] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 items-start p-4 sm:p-2.5 bg-variable-collection-4-white-duplicate rounded-[20px] lg:rounded-[30px] opacity-80">
        <div className="flex flex-col items-start gap-1">
          <div className="font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            Cпорт
          </div>
          {sportItems.map((item) => (
            <div
              key={item}
              className="text-[length:var(--s-interface-font-size)] font-s-interface font-[number:var(--s-interface-font-weight)] text-[#212121] tracking-[var(--s-interface-letter-spacing)] leading-[var(--s-interface-line-height)] [font-style:var(--s-interface-font-style)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            Кіберспорт
          </div>
          {esportItems.map((item) => (
            <div
              key={item}
              className="font-s-interface font-[number:var(--s-interface-font-weight)] text-[#212121] text-[length:var(--s-interface-font-size)] tracking-[var(--s-interface-letter-spacing)] leading-[var(--s-interface-line-height)] [font-style:var(--s-interface-font-style)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            Форум
          </div>
          {forumItems.map((item) => (
            <div
              key={item}
              className="font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Footer
