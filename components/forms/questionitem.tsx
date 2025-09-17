"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  id: string;  // question id (FieldPath do formulário)
  label: string;
  control: ReturnType<typeof useForm<any>>["control"];
  errorMessage?: string;
  colorForOption: (opt: number) => string;
  scale?: number;
  minLabel?: string;
  maxLabel?: string;
};

export default function QuestionItem({
  id,
  label,
  control,
  errorMessage,
  colorForOption,
  scale = 5,
  minLabel = "Discordo totalmente",
  maxLabel = "Concordo totalmente",
}: Props) {
  return (
    <fieldset
      id={id}
      className="rounded-md p-3 sm:p-4 border border-gray-100 bg-white shadow-sm"
      aria-labelledby={`${id}-label`}
    >
      <legend id={`${id}-label`} className="text-sm font-medium text-gray-800 mb-2">
        {label}
      </legend>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-3 px-2">
          <Controller
            control={control}
            name={id as any}
            render={({ field }) => {
              const selected = Number(field.value ?? 0);
              return (
                <>
                  {Array.from({ length: scale }, (_, k) => k + 1).map((opt) => {
                    const inputId = `${id}-${opt}`;
                    const isSelected = selected === opt;
                    return (
                      <label
                        key={inputId}
                        htmlFor={inputId}
                        className="flex flex-col items-center cursor-pointer select-none"
                      >
                        <input
                          id={inputId}
                          type="radio"
                          className="sr-only"
                          value={String(opt)}
                          checked={isSelected}
                          onChange={() => field.onChange(opt)}
                          aria-checked={isSelected}
                          aria-label={`${opt} de ${scale}`}
                        />
                        <span
                          aria-hidden
                          className="rounded-full transition-transform duration-150 ease-out"
                          title={`${opt} / ${scale}`}
                          style={{
                            background: colorForOption(opt),
                            width: isSelected ? 44 : 36,
                            height: isSelected ? 44 : 36,
                            transform: isSelected ? "scale(1.08)" : "scale(1)",
                            border: isSelected ? "3px solid #000" : "1px solid rgba(0,0,0,0.06)",
                            boxShadow: isSelected ? "0 8px 18px rgba(0,0,0,0.12)" : "none",
                            display: "inline-block",
                          }}
                        />
                      </label>
                    );
                  })}
                </>
              );
            }}
          />
        </div>

        <div className="w-full px-4">
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        </div>
      </div>

      {errorMessage && <p className="text-xs text-red-600 mt-2">{errorMessage}</p>}
    </fieldset>
  );
}
