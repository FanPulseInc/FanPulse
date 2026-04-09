import Link from "next/link";
import x1 from "../favicon.ico";
import frame234 from "../favicon.ico";
import image from "../favicon.ico";
import vector2 from "../favicon.ico";
import vector3 from "../favicon.ico";
import vector4 from "../favicon.ico";
import vector5 from "../favicon.ico";
import vector from "../favicon.ico";
import { ICONS } from "../svg";

const navItems = [
  { icon: ICONS.HOME, alt: "Vector", label: "ГОЛОВНА" },
  { icon: ICONS.SPORT, alt: "Vector", label: "СПОРТ" },
  { icon: ICONS.ESPORT, alt: "Vector", label: "КІБЕРСПОРТ" },
  { icon: ICONS.FORUM, alt: "Vector", label: "ФОРУМ" },
];

const Header = () => {
  return (
    <div className="w-[100%] h-[172px] flex bg-[#ffffff] rounded-[0px_0px_20px_20px] overflow-hidden">
      <div className="flex mt-[11px] w-[1360px] h-40 ml-10 relative flex-col items-start gap-2.5 bg-variable-collection-5-lightwhite">
        <div className="flex h-[70px] items-center justify-between relative self-stretch w-full">
          {ICONS.ICON}

          <div className="flex w-[600px] h-[50px] items-center justify-center gap-[60px] pl-3 pr-1 py-1 relative bg-variable-collection-4-white-duplicate rounded-[50px] border-2 border-solid border-variable-collection-2-red-duplicate">
            <div className="flex-1 text-variable-collection-1-black-duplicate relative font-l-interface font-[number:var(--l-interface-font-weight)] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
              Що Ви шукаєте?
            </div>

            <div className="inline-flex items-center gap-1 relative self-stretch flex-[0_0_auto]">
              <div className="inline-flex items-center gap-2.5 p-2.5 relative flex-[0_0_auto] bg-variable-collection-2-red-duplicate rounded-[50px] overflow-hidden">
                {ICONS.SEARCH}
              </div>
            </div>
          </div>

          <div className="inline-flex items-start gap-[25px] relative flex-[0_0_auto] bg-variable-collection-4-white-duplicate">
            <div className="flex w-[100px] h-[50px] items-center justify-center gap-1 px-6 py-4 relative rounded-[50px] border-2 border-solid border-variable-collection-2-red-duplicate">
              <div className="inline-flex items-center gap-1 px-2 py-1 relative flex-[0_0_auto] mt-[-10.00px] mb-[-10.00px] ml-[-13.00px] mr-[-13.00px]">
                <div className="w-fit mt-[-1.00px] text-variable-collection-2-red-duplicate whitespace-nowrap relative font-l-interface font-[number:var(--l-interface-font-weight)] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
                  Мова
                </div>

                <div className="relative w-4 h-4">
                  {/* <img
                    className="absolute w-[81.25%] h-[68.75%] top-[31.25%] left-[18.75%]"
                    alt="Vector"
                    src={image}
                  /> */}
                </div>
              </div>
            </div>

            <div className="flex w-[100px] h-[50px] items-center justify-center gap-1 px-6 py-4 relative bg-brand-red rounded-[50px]">
              <Link href={"?auth=login"} className="w-fit mt-[-7.00px] mb-[-5.00px] text-white whitespace-nowrap relative font-l-interface font-[number:var(--l-interface-font-weight)] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
                Увійти
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
          <div className="inline-flex h-20 items-center gap-12 relative flex-[0_0_auto]">
            <div className="inline-flex h-20 items-center gap-[30px] relative flex-[0_0_auto]">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  className="inline-flex items-center justify-center gap-[5px] p-2.5 relative flex-[0_0_auto] rounded-[10px]"
                >
                  <div className="flex w-[18px] h-[18px] items-start justify-center gap-[3px] p-px relative">
                    {item.icon}
                  </div>

                  <div className="relative flex items-center justify-center w-fit text-[#af292a] text-base font-medium text-center whitespace-nowrap">
                    {item.label}
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="w-[425px] h-[50px] p-[0px] flex flex-row justify-between items-center gap-[324px];">
            {ICONS.NOTIFY}
            {ICONS.STAR}
            {ICONS.TV}
            {ICONS.ASK}
            {ICONS.SETTING}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header