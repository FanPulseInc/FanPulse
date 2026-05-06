"use client"

import { useState } from "react"
import { useGetApiCategory } from "@/services/api/generated"
import { useT } from "@/services/i18n/context"
import CustomSelect from "../CustomSelect"

interface CategorySelectModalProps {
  onSubmit: (categoryIds: string[]) => Promise<void> | void
  onClose: () => void
  isPending?: boolean
}

export default function CategorySelectModal({
  onSubmit,
  onClose,
  isPending = false,
}: CategorySelectModalProps) {
  const { t } = useT()
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const [error, setError] = useState("")

  const { isLoading, data } = useGetApiCategory()

  const categories =
    data?.map((item) => ({
      value: item.id ?? "",
      label: item.name ?? "",
    })) || []

  const handleSelectChange = (selectedIds: string[]) => {
    if (selectedIds.length > 2) {
      setSelectedCategory(selectedIds.slice(0, 2))
      setError(t("auth_max_categories"))
      return
    }

    setSelectedCategory(selectedIds)
    setError("")
  }

  const handleSubmit = async () => {
    if (selectedCategory.length !== 2) {
      setError(t("auth_exact_categories"))
      return
    }

    await onSubmit(selectedCategory)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[370px] bg-white rounded-[20px] p-8 flex flex-col gap-5 shadow-xl"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-h1 text-brand-black">{t("auth_choose_categories")}</h2>
          <p className="text-body-s text-brand-black/60">
            {t("auth_choose_categories_desc")}
          </p>
        </div>

        {isLoading ? (
          <p className="text-body-s text-brand-red">{t("loading")}</p>
        ) : (
          <CustomSelect
            options={categories}
            onChange={handleSelectChange}
            value={selectedCategory}
            maxSelected={2}
          />
        )}

        {error && (
          <p className="text-body-s text-brand-red">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-[50px] flex-1 border-2 border-brand-red text-brand-red rounded-[12px] font-semibold hover:bg-brand-red/5 transition-all cursor-pointer disabled:opacity-50"
          >
            {t("auth_back")}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || selectedCategory.length !== 2}
            className="h-[50px] flex-1 bg-brand-red text-white rounded-[12px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("auth_saving") : t("auth_continue")}
          </button>
        </div>
      </div>
    </div>
  )
}
