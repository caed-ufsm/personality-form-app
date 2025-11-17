"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { FieldValues, UseFormGetValues } from "react-hook-form";

type Status = null | "idle" | "saving" | "saved" | "error";

export type PagerActionsProps<TValues extends FieldValues = FieldValues> = {
  page: number;
  numPages: number;
  status: Status;
  goPrev: () => void;
  goNext: () => void;
  onClear: () => void;
  controlApi: {
    getValues: UseFormGetValues<TValues>;
    setStatus: React.Dispatch<React.SetStateAction<Status>>;
    storageKey?: string;
  };
  nextFormId?: string | null;
};

export default function PagerActions<
  TValues extends FieldValues = FieldValues
>({
  page,
  numPages,
  status,
  goPrev,
  goNext,
  onClear,
  controlApi,
  nextFormId,
}: PagerActionsProps<TValues>) {
  const { getValues, setStatus, storageKey } = controlApi;
  const router = useRouter();

  const isLastPage = page >= numPages - 1;

  // 🔹 Sanitiza o próximo form, removendo "null", "undefined", "", "   "
  const safeNextFormId =
    nextFormId &&
    nextFormId !== "null" &&
    nextFormId !== "undefined" &&
    nextFormId.trim() !== ""
      ? nextFormId
      : null;

  const handleNext = () => {
    if (isLastPage) {
      if (safeNextFormId) {
        router.push(`/forms/${safeNextFormId}`);
      } else {
        // Último formulário → volta à lista
        router.push(`/forms`);
      }
      return;
    }

    goNext();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1">
      <div className="flex gap-2 w-full sm:w-auto">
        {/* Botão voltar */}
        <button
          type="button"
          onClick={goPrev}
          disabled={page === 0}
          className={`px-3 py-2 rounded text-sm w-full sm:w-auto
            ${
              page === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400 text-gray-800"
            }`}
        >
          Característica anterior
        </button>

        {/* Botão avançar */}
        <button
          type="button"
          onClick={handleNext}
          disabled={isLastPage && !safeNextFormId}
          className={`px-3 py-2 rounded text-white w-full sm:w-auto text-sm transition
            ${
              isLastPage
                ? safeNextFormId
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#005C8B] hover:bg-[#00476b]"
            }`}
        >
          {isLastPage
            ? safeNextFormId
              ? "Próximo formulário →"
              : "Fim do formulário"
            : "Próxima Característica"}
        </button>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Botão salvar rascunho */}
        <button
          type="button"
          onClick={() => {
            try {
              const data = getValues();
              const key = storageKey ?? "form_draft_generic";
              localStorage.setItem(key, JSON.stringify(data));
              setStatus("saved");
              setTimeout(() => setStatus("idle"), 900);
            } catch {
              setStatus("error");
            }
          }}
          className="px-3 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-sm w-full sm:w-auto"
        >
          Salvar rascunho
        </button>

        {/* Botão limpar tudo */}
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm w-full sm:w-auto"
        >
          Limpar tudo
        </button>

        {/* Status */}
        <div className="text-xs text-gray-600 ml-2">
          {status === "saving"
            ? "Salvando..."
            : status === "saved"
            ? "Salvo"
            : ""}
        </div>
      </div>
    </div>
  );
}
