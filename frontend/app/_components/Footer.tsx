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
    <div className="w-[1440px] h-[258px] flex gap-11 bg-[color:var(--variable-collection-4-white)]">
      <div className="mt-6 w-[653px] h-44 ml-[45px] flex-col items-center gap-2.5 p-2.5 bg-variable-collection-4-white-duplicate rounded-[30px] opacity-80 flex relative">
        <div className="flex-col w-[624px] h-5 items-start justify-center gap-1 rounded-[20px] flex relative">
          <div className="mt-[-7.00px] mb-[-3.00px] text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Інформація
          </div>
        </div>

        <div className="flex-col w-[623px] h-[126px] items-center justify-around gap-1 rounded-[20px] flex relative">
          <p className="relative flex items-center self-stretch h-[122px] [font-family:'Inter-Medium',Helvetica] font-medium text-[#212121] text-xs tracking-[0] leading-5">
            FanPulse.com пропонує результати, рахунок та підсумкові таблиці
            матчів у спорті та кіберспорті. Слідкуйте за своїми улюбленими
            командами прямо зараз! Обговорюйте результати відразу на форумі не
            виходячи із сайту. Результати на FanPulse.com оновлюються
            автоматично, і вам не потрібно оновлювати їх вручну. Додавши матчі,
            за якими ви хочете стежити, до улюблених, ви будете в курсі
            результатів усіх матчів та всієї статистики.Це унікальний сайт, що
            поєднує статистику спорту, кіберспорту і форум.
          </p>
        </div>
      </div>

      <div className="mt-6 w-[653px] h-[210px] items-start justify-between p-2.5 bg-variable-collection-4-white-duplicate rounded-[30px] opacity-80 flex relative">
        <div className="flex flex-col w-[164px] h-56 items-start gap-1 relative mb-[-34.00px] rounded-[20px]">
          <div className="relative flex items-center w-fit mt-[-2.00px] font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Cпорт
          </div>
          {sportItems.map((item) => (
            <div
              key={item}
              className="text-[length:var(--s-interface-font-size)] relative flex items-center w-fit font-s-interface font-[number:var(--s-interface-font-weight)] text-[#212121] tracking-[var(--s-interface-letter-spacing)] leading-[var(--s-interface-line-height)] whitespace-nowrap [font-style:var(--s-interface-font-style)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-col w-[164px] h-56 items-start gap-1 relative mb-[-34.00px] rounded-[20px]">
          <div className="mt-[-2.00px] text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Кіберспорт
          </div>
          <div className="relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            League of Legends
          </div>
          {esportItems.slice(1).map((item) => (
            <div
              key={item}
              className="relative flex items-center w-fit font-s-interface font-[number:var(--s-interface-font-weight)] text-[#212121] text-[length:var(--s-interface-font-size)] tracking-[var(--s-interface-letter-spacing)] leading-[var(--s-interface-line-height)] whitespace-nowrap [font-style:var(--s-interface-font-style)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="flex flex-col w-[164px] h-56 items-start gap-1 relative mb-[-34.00px] rounded-[20px]">
          <div className="mt-[-2.00px] text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Форум
          </div>
          <div className="text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Контакти
          </div>
          <div className="mr-[-5.00px] text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Політика приватності
          </div>
          <div className="relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Політика Cookies
          </div>
          <div className="mr-[-6.00px] text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Політика доступності
          </div>
          <div className="text-[length:var(--l-interface-font-size)] relative flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-[#212121] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] whitespace-nowrap [font-style:var(--l-interface-font-style)]">
            Реклама
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer