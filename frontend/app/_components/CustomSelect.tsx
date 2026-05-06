"use client";

import Select, { MultiValue, StylesConfig } from "react-select";
import { useT } from "@/services/i18n/context";

interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    placeholder?: string;
    onChange: (values: string[]) => void;
    value?: string[];
    maxSelected?: number;
}

const CustomSelect = ({ options, placeholder, onChange, value, maxSelected }: Props) => {
    const { t } = useT();


    const customStyles: StylesConfig<Option, true> = {
        control: (base, state) => ({
            ...base,
            borderRadius: "50px",
            padding: "0 10px",
            minHeight: "50px",
            borderColor: state.isFocused ? "#af292a" : "#af292a",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#af292a",
            },
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: "rgba(225, 29, 72, 0.1)",
            borderRadius: "20px",
            color: "#af292a",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: "#af292a",
            fontWeight: "500",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: "#af292a",
            "&:hover": {
                backgroundColor: "#af292a",
                color: "white",
                borderRadius: "50%",
            },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#af292a" : state.isFocused ? "rgba(225, 29, 72, 0.05)" : "white",
            color: state.isSelected ? "white" : "black",
            "&:active": {
                backgroundColor: "#af292a",
            },
        }),
    };

    const handleChange = (newValue: MultiValue<Option>) => {
        onChange(newValue.map((v) => v.value));
    };

    const selectedValues = value
        ? options.filter((o) => value.includes(o.value))
        : undefined;

    const atLimit = maxSelected != null && (value?.length ?? 0) >= maxSelected;

    return (
        <div className="flex flex-col gap-2 w-full max-w-[400px]">
            <label className="text-body-1 font-medium text-brand-black ml-4">
                {t("select_category")}
            </label>
            <Select
                isMulti
                options={options}
                styles={customStyles}
                placeholder={placeholder ?? t("select_categories_placeholder")}
                onChange={handleChange}
                noOptionsMessage={() => t("nothing_found")}
                value={selectedValues}
                isOptionDisabled={() => atLimit}
            />
        </div>
    );
};

export default CustomSelect;
