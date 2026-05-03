import { ICONS } from "./svg";

export default function Page() {
  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="p-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-stretch">
            <div className="bg-[#efefef] rounded-[24px] border-2 border-brand-red p-4 h-full flex flex-col">
              <div className="flex items-center justify-center gap-2 text-brand-red font-medium mb-3 min-h-[50px]">
                <svg
                  width="145"
                  height="50"
                  viewBox="0 0 145 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M51 34L38.5315 25.4136L33.0365 33.8452L39.2132 30.5103L51 34ZM33 19.5568L43.2254 26.7975L48.0152 19.4546L42.6863 22.3777L33 19.5568ZM43.8692 18.2644C43.8692 18.5615 43.8261 18.8557 43.7424 19.1302C43.6587 19.4048 43.5359 19.6542 43.3812 19.8643C43.2265 20.0744 43.0428 20.241 42.8407 20.3547C42.6385 20.4684 42.4219 20.5269 42.2031 20.5269C41.761 20.5269 41.337 20.2885 41.0244 19.864C40.7118 19.4395 40.5362 18.8638 40.5362 18.2635C40.5362 17.6632 40.7118 17.0874 41.0244 16.663C41.337 16.2385 41.761 16 42.2031 16C42.422 16 42.6388 16.0586 42.841 16.1724C43.0432 16.2862 43.227 16.4531 43.3817 16.6633C43.5365 16.8736 43.6591 17.1233 43.7428 17.398C43.8265 17.6727 43.8694 17.9671 43.8692 18.2644Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M66.8743 23H65.4652C65.3819 22.5947 65.236 22.2386 65.0277 21.9318C64.8232 21.625 64.5732 21.3674 64.2777 21.1591C63.986 20.947 63.6622 20.7879 63.3061 20.6818C62.95 20.5758 62.5788 20.5227 62.1925 20.5227C61.4879 20.5227 60.8497 20.7008 60.2777 21.0568C59.7095 21.4129 59.2569 21.9375 58.9197 22.6307C58.5864 23.3239 58.4197 24.1742 58.4197 25.1818C58.4197 26.1894 58.5864 27.0398 58.9197 27.733C59.2569 28.4261 59.7095 28.9508 60.2777 29.3068C60.8497 29.6629 61.4879 29.8409 62.1925 29.8409C62.5788 29.8409 62.95 29.7879 63.3061 29.6818C63.6622 29.5758 63.986 29.4186 64.2777 29.2102C64.5732 28.9981 64.8232 28.7386 65.0277 28.4318C65.236 28.1212 65.3819 27.7652 65.4652 27.3636H66.8743C66.7682 27.9583 66.575 28.4905 66.2947 28.9602C66.0144 29.4299 65.666 29.8295 65.2493 30.1591C64.8326 30.4848 64.3648 30.733 63.8459 30.9034C63.3307 31.0739 62.7796 31.1591 62.1925 31.1591C61.2 31.1591 60.3175 30.9167 59.5447 30.4318C58.772 29.947 58.1641 29.2576 57.7209 28.3636C57.2777 27.4697 57.0561 26.4091 57.0561 25.1818C57.0561 23.9545 57.2777 22.8939 57.7209 22C58.1641 21.1061 58.772 20.4167 59.5447 19.9318C60.3175 19.447 61.2 19.2045 62.1925 19.2045C62.7796 19.2045 63.3307 19.2898 63.8459 19.4602C64.3648 19.6307 64.8326 19.8807 65.2493 20.2102C65.666 20.536 66.0144 20.9337 66.2947 21.4034C66.575 21.8693 66.7682 22.4015 66.8743 23ZM77.8558 19.3636V31H76.4467V20.6136H70.5831V31H69.174V19.3636H77.8558ZM90.5163 25.1818C90.5163 26.4091 90.2947 27.4697 89.8516 28.3636C89.4084 29.2576 88.8004 29.947 88.0277 30.4318C87.255 30.9167 86.3724 31.1591 85.38 31.1591C84.3875 31.1591 83.505 30.9167 82.7322 30.4318C81.9595 29.947 81.3516 29.2576 80.9084 28.3636C80.4652 27.4697 80.2436 26.4091 80.2436 25.1818C80.2436 23.9545 80.4652 22.8939 80.9084 22C81.3516 21.1061 81.9595 20.4167 82.7322 19.9318C83.505 19.447 84.3875 19.2045 85.38 19.2045C86.3724 19.2045 87.255 19.447 88.0277 19.9318C88.8004 20.4167 89.4084 21.1061 89.8516 22C90.2947 22.8939 90.5163 23.9545 90.5163 25.1818ZM89.1527 25.1818C89.1527 24.1742 88.9841 23.3239 88.647 22.6307C88.3137 21.9375 87.861 21.4129 87.2891 21.0568C86.7209 20.7008 86.0845 20.5227 85.38 20.5227C84.6754 20.5227 84.0372 20.7008 83.4652 21.0568C82.897 21.4129 82.4444 21.9375 82.1072 22.6307C81.7739 23.3239 81.6072 24.1742 81.6072 25.1818C81.6072 26.1894 81.7739 27.0398 82.1072 27.733C82.4444 28.4261 82.897 28.9508 83.4652 29.3068C84.0372 29.6629 84.6754 29.8409 85.38 29.8409C86.0845 29.8409 86.7209 29.6629 87.2891 29.3068C87.861 28.9508 88.3137 28.4261 88.647 27.733C88.9841 27.0398 89.1527 26.1894 89.1527 25.1818ZM92.8857 31V19.3636H96.8175C97.7304 19.3636 98.4766 19.5284 99.0561 19.858C99.6394 20.1837 100.071 20.625 100.352 21.1818C100.632 21.7386 100.772 22.3598 100.772 23.0455C100.772 23.7311 100.632 24.3542 100.352 24.9148C100.075 25.4754 99.647 25.9223 99.0675 26.2557C98.4879 26.5852 97.7455 26.75 96.8402 26.75H94.022V25.5H96.7947C97.4197 25.5 97.9216 25.392 98.3004 25.1761C98.6792 24.9602 98.9538 24.6686 99.1243 24.3011C99.2985 23.9299 99.3857 23.5114 99.3857 23.0455C99.3857 22.5795 99.2985 22.1629 99.1243 21.7955C98.9538 21.428 98.6773 21.1402 98.2947 20.9318C97.9122 20.7197 97.4046 20.6136 96.772 20.6136H94.2947V31H92.8857ZM102.406 20.6136V19.3636H111.133V20.6136H107.474V31H106.065V20.6136H102.406Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex gap-4 text-brand-red">
                  <span className="cursor-pointer">Все</span>
                  <span className="cursor-pointer">Улюблене</span>
                  <span className="cursor-pointer">Змагання</span>
                </div>

                <div className="flex items-center gap-2 text-brand-red">
                  <button>{"<"}</button>
                  <span className="bg-white px-3 py-1 rounded-full border border-brand-red/20">
                    Сьогодні
                  </span>
                  <button>{">"}</button>
                </div>
              </div>

              <div className="flex gap-3 mb-4 justify-between min-h-[40px]">
                {[ICONS.FOOTBALL,ICONS.BASCETBALL,ICONS.RUGBY,ICONS.MOTO,ICONS.TENIS].map((icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-brand-red rounded-full text-lg"
                  >
                    {icon}
                  </div>
                ))}
              </div>

              <img
                src="/category/sport.png"
                className="w-full h-[220px] object-cover rounded-[18px] mt-auto"
              />
            </div>

            <div className="bg-[#efefef] rounded-[24px] border-2 border-brand-red p-4 h-full flex flex-col">
              <div className="flex items-center justify-center gap-2 text-brand-red font-medium mb-3 min-h-[50px]">
                <img src={"icons/esport_icon.png"} className="w-[140px] h-[20px]" />
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex gap-4 text-brand-red">
                  <span>Все</span>
                  <span>Улюблене</span>
                  <span>Змагання</span>
                </div>

                <div className="flex items-center gap-2 text-brand-red">
                  <button>{"<"}</button>
                  <span className="bg-white px-3 py-1 rounded-full border border-brand-red/20">
                    Сьогодні
                  </span>
                  <button>{">"}</button>
                </div>
              </div>

              <div className="flex gap-4 mb-4 justify-between px-6 min-h-[40px]">
                {[<img src={"icons/cs2.jpg"} />, <img src={"icons/dota2.png"} />].map(
                  (icon, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-brand-red rounded-xl text-lg"
                    >
                      {icon}
                    </div>
                  )
                )}
              </div>

              <img
                src="/category/esport.png"
                className="w-full h-[220px] object-cover rounded-[18px] mt-auto"
              />
            </div>

            <div className="bg-[#efefef] rounded-[24px] border-2 border-brand-red p-4 h-full flex flex-col">
              <div className="flex items-center justify-center gap-2 text-brand-red font-medium mb-3 min-h-[50px]">
                <img src={"icons/forum_icon.png"} className="w-[100px] h-[20px]" />
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex gap-4 text-brand-red">
                  <span>Все</span>
                  <span>Улюблене</span>
                  <span>Змагання</span>
                </div>

                <div className="flex items-center gap-2 text-brand-red">
                  <button>{"<"}</button>
                  <span className="bg-white px-3 py-1 rounded-full border border-brand-red/20">
                    Сьогодні
                  </span>
                  <button>{">"}</button>
                </div>
              </div>

              <div className="flex gap-3 mb-4 justify-between min-h-[40px]">
                {[ICONS.FOOTBALL,ICONS.BASCETBALL,ICONS.RUGBY,ICONS.MOTO,ICONS.TENIS].map((icon, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-brand-red rounded-full text-lg"
                  >
                    {icon}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 mb-4 min-h-[40px]">
                {[<img src={"icons/cs2.jpg"} />, <img src={"icons/dota2.png"} />].map(
                  (icon, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-brand-red rounded-xl text-lg"
                    >
                      {icon}
                    </div>
                  )
                )}
              </div>

              <img
                src="/category/forum.png"
                className="w-full h-[220px] object-cover rounded-[18px] mt-auto"
              />
            </div>
          </div>
        </div>

        <div className="w-[100%] overflow-hidden">
          <div className="flex w-max gap-2 marquee">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-2 shrink-0">
                <img src="/banners/beton.png" className="h-24 rounded-xl shrink-0" />
                <img src="/banners/vbet.png" className="h-24 rounded-xl shrink-0" />
                <img src="/banners/sportshop.png" className="h-24 rounded-xl shrink-0" />
                <img src="/banners/fit.png" className="h-24 rounded-xl shrink-0" />
                <img src="/banners/roullete.png" className="h-24 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}