"use client";

import Select, { MultiValue, StylesConfig } from "react-select";

interface Option {
    value: string;
    label: string;
}

interface Props {
    options: Option[];
    placeholder?: string;
    onChange: (values: string[]) => void;
}

const CustomSelect = ({ options, placeholder = "Оберіть категорії...", onChange }: Props) => {


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

    return (
        <div className="flex flex-col gap-2 w-full max-w-[400px]">
            <label className="text-body-1 font-medium text-brand-black ml-4">
                Оберіть категорію
            </label>
            <Select
                isMulti
                options={options}
                styles={customStyles}
                placeholder={placeholder}
                onChange={handleChange}
                noOptionsMessage={() => "Нічого не знайдено"}
            />
        </div>
    );
};

export default CustomSelect;
