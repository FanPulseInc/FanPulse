"use client"

import { useState } from "react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}


export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: Props) {
  const [value, setValue] = useState("")

  if (!isOpen) return null

  const isValid = value === "DELETE"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[400px] bg-white rounded-[20px] p-6 flex flex-col gap-4 shadow-xl">
        
        <h2 className="text-xl font-bold text-brand-red">
          Видалення акаунта
        </h2>

        <p className="text-sm text-brand-black/70">
          Це незворотна дія. Всі ваші дані будуть видалені.
        </p>

        <p className="text-sm text-brand-black">
          Введіть <span className="font-bold text-brand-red">DELETE</span> щоб підтвердити
        </p>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-[45px] px-4 rounded-[12px] border-2 border-brand-red outline-none"
          placeholder="DELETE"
        />

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 h-[45px] rounded-[12px] border border-gray-300 hover:bg-gray-100"
          >
            Скасувати
          </button>

          <button
            disabled={!isValid}
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 h-[45px] rounded-[12px] text-white transition ${
              isValid
                ? "bg-red-600 hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Видалити
          </button>
        </div>
      </div>
    </div>
  )
}