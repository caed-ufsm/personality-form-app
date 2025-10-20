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
  options = ["A", "B", "C", "D", "E"],
  minLabel = "Discordo Totalmente",
  maxLabel = "Concordo Totalmente",
}: Props) {
  // Paleta da imagem (vermelho -> verde)
  const colors = [
    "#ef4444", // vermelho
    "#f97316", // laranja
    "#eab308", // amarelo
    "#22c55e", // verde claro
    "#16a34a", // verde forte
  ];

  return (
    <fieldset
      id={id}
      className="rounded-lg p-6 sm:p-8 border border-gray-200 bg-white shadow-sm max-w-5xl mx-auto"
      aria-labelledby={`${id}-label`}
    >
      {/* Texto da pergunta dentro do box */}
      <div
        id={`${id}-label`}
        className="text-base sm:text-lg font-medium text-gray-800 mb-6 leading-relaxed break-words"
      >
        {label}
      </div>

      {/* Labels do topo */}
      <div className="flex justify-between text-sm text-gray-600 mb-3">
        <span className="font-bold">{minLabel}</span>
        <span className="font-bold">{maxLabel}</span>
      </div>

      {/* Opções */}
      <Controller
        control={control}
        name={id as any}
        render={({ field }) => {
          const selected = Number(field.value ?? 0);

          return (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {Array.from({ length: scale }, (_, i) => {
                const opt = options[i]; // A, B, C, D, E
                const value = i + 1; // 1–5 (valor salvo no formulário)
                const isSelected = selected === value;
                const inputId = `${id}-${opt}`;
                const color = colors[i] || "#ccc";

                return (
                  <label
                    key={inputId}
                    htmlFor={inputId}
                    className={`border-2 rounded-md w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center text-base sm:text-lg font-semibold cursor-pointer transition-all
                      ${
                        isSelected
                          ? "text-white shadow-md scale-105"
                          : "text-gray-700 hover:scale-105"
                      }`}
                    style={{
                      borderColor: color,
                      backgroundColor: isSelected ? color : "transparent",
                    }}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      className="sr-only"
                      value={value}
                      checked={isSelected}
                      onChange={() => field.onChange(value)} // 🔹 salva número (1–5)
                    />
                    {opt}
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
