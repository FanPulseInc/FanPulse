export default function Footer() {
  return (
    <footer className="bg-white border-t mt-6">
  {/* Заменяем grid на flex justify-between */}
  <div className="max-w-full mx-auto p-6 flex flex-col md:flex-row justify-between gap-8 text-sm text-gray-600">
    
    
    <div className="md:max-w-2xl">
      <h3 className="font-semibold mb-2 text-black">Інформація</h3>
      <p>
        FanPulse.com пропонує результати...
      </p>
    </div>

    
    <div className="flex gap-12 mr-12">
      <div>
        <h3 className="font-semibold mb-2 text-black">Спорт</h3>
        <ul className="space-y-1">
          <li>Футбол</li>
          <li>Баскетбол</li>
          <li>Теніс</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-black">Кіберспорт</h3>
        <ul className="space-y-1">
          <li>CS2</li>
          <li>Dota 2</li>
          <li>LoL</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-black">Форум</h3>
        <ul className="space-y-1">
          <li>Контакти</li>
          <li>Політика</li>
        </ul>
      </div>
    </div>

  </div>
</footer>

  );
}