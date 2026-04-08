import { ICONS } from "@/app/svg"

const ConfirmRegister = () => {
    return (
        <div className="w-[370px] min-h-[650px] bg-white rounded-[20px] flex flex-col items-center p-10 text-left shadow-sm">
            
            
            <div className="relative mb-10 mt-6">
                <img 
                    className="w-[245px] h-auto aspect-[0.9] object-contain" 
                    src={ICONS.Fox} 
                    alt="Fox"
                />
            </div>

            {/* Текстовый блок */}
            <div className="flex flex-col gap-5 w-full">
                <h1 className="text-h1 text-brand-black">
                    Реєстрація
                </h1>

                <p className="text-body-m text-brand-black/80 leading-relaxed">
                    На вказану електронну адресу надіслано лист для підтвердженням
                    реєстрації.
                </p>
            </div>
            
            {/* Можно добавить кнопку "Понятно" или "На главную" в стиле brand-red */}
        </div>
    )
}

export default ConfirmRegister
