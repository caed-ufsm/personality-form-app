"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  id: string;
  label: string;
  control: ReturnType<typeof useForm<any>>["control"];
  errorMessage?: string;
  scale?: number;
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
};

export default function QuestionItem({
  id,
  label,
  control,
  errorMessage,
  scale = 5,
  options = ["1", "2", "3", "4", "5"],
  minLabel = "Discordo totalmente",
  maxLabel = "Concordo totalmente",
}: Props) {
  const colors = [
    "#005C8B", //azul UFSM
    "#005C8B", //azul UFSM
    "#005C8B", //azul UFSM
    "#005C8B", //azul UFSM
    "#005C8B", //azul UFSM
  ];

  const optionLabels = [
    "Discordo totalmente",
    "Discordo",
    "Neutro",
    "Concordo",
    "Concordo totalmente",
  ];

  return (
    <fieldset
      id={id}
      className="rounded-lg p-4 sm:p-6 border border-gray-200 bg-white shadow-sm max-w-3xl mx-auto"
      aria-labelledby={`${id}-label`}
    >
      {/* Pergunta */}
      <div
        id={`${id}-label`}
        className="text-sm sm:text-base font-bold text-gray-800 mb-4 leading-relaxed break-words"
      >
        {label}
      </div>

      {/* Opções */}
      <Controller
        control={control}
        name={id as any}
        render={({ field }) => {
          const selected = Number(field.value ?? 0);

          return (
            <div className="flex justify-center flex-wrap sm:flex-nowrap gap-1 sm:gap-3 w-full">
              {Array.from({ length: scale }, (_, i) => {
                const opt = options[i];
                const value = i + 1;
                const isSelected = selected === value;
                const inputId = `${id}-${opt}`;
                const color = colors[i] || "#ccc";

                return (
                  <label
                    key={inputId}
                    htmlFor={inputId}
                    className={`border-2 rounded-md flex flex-col items-center justify-center cursor-pointer transition-all text-center select-none
                      ${
                        isSelected
                          ? "text-white shadow-md scale-105"
                          : "text-gray-700 hover:scale-105"
                      }`}
                    style={{
                      borderColor: color,
                      backgroundColor: isSelected ? color : "transparent",
                      width: "clamp(60px, 15vw, 100px)", // 🔹 maior no desktop
                      height: "clamp(60px, 15vw, 100px)",
                    }}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      className="sr-only"
                      value={value}
                      checked={isSelected}
                      onChange={() => field.onChange(value)}
                    />
                    <span className="text-base font-bold">{value}</span>
                    <span className="text-[10px] sm:text-[11px] mt-1 leading-tight px-1 font-bold">
                      {optionLabels[i]}
                    </span>
                  </label>
                );
              })}
            </div>
          );
        }}
      />

      {errorMessage && (
        <p className="text-xs text-red-600 mt-3">{errorMessage}</p>
      )}
    </fieldset>
  );
}
