"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { FieldValues, UseFormGetValues, UseFormSetValue } from "react-hook-form";

type Status = null | "idle" | "saving" | "saved" | "error";

export type PagerActionsProps<TValues extends FieldValues = FieldValues> = {
  page: number;
  numPages: number;
  status: Status;
  goPrev: () => void;
  goNext: () => void;

  // ids dos campos da característica atual (faceta)
  currentFieldIds: string[];

  controlApi: {
    getValues: UseFormGetValues<TValues>;
    setValue: UseFormSetValue<TValues>;
    setStatus: React.Dispatch<React.SetStateAction<Status>>;
    storageKey?: string;
  };
};

export default function PagerActions<TValues extends FieldValues = FieldValues>({
  page,
  numPages,
  status,
  goPrev,
  goNext,
  currentFieldIds,
  controlApi,
}: PagerActionsProps<TValues>) {
  const { getValues, setValue, storageKey } = controlApi;
  const router = useRouter();

  const isLastPage = page >= numPages - 1;
  const isFirstPage = page === 0;

  // modal confirmar limpar
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  const openConfirm = () => {
    setConfirmOpen(true);
    setTimeout(() => cancelRef.current?.focus(), 0);
  };
  const closeConfirm = () => setConfirmOpen(false);

  const confirmClearCurrent = () => {
    try {
      // limpa somente os campos dessa característica
      for (const id of currentFieldIds) {
        setValue(id as any, 0 as any, {
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false,
        });
      }

      // mantém rascunho atualizado (se você usa autosave local)
      try {
        const data = getValues();
        const key = storageKey ?? "form_draft_generic";
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    } finally {
      closeConfirm();
    }
  };

  // ESC fecha o modal
  React.useEffect(() => {
    if (!confirmOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && closeConfirm();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen]);

  const blueEnabled = "bg-[#005C8B] hover:bg-[#00476b] text-white";
  const blueDisabled = "bg-[#005C8B]/40 text-white/80 cursor-not-allowed";

  return (
    <>
      <div className="mt-2">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:items-center sm:justify-between">
          {/* Grupo esquerdo */}
          <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-auto sm:flex sm:gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirstPage}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto ${
                isFirstPage ? blueDisabled : blueEnabled
              }`}
            >
              ← Anterior
            </button>

            {/* Próxima (normal) OU Voltar (no mobile quando é o fim) */}
            {!isLastPage ? (
              <button
                type="button"
                onClick={goNext}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto ${blueEnabled}`}
              >
                Próxima →
              </button>
            ) : (
              <>
                {/* ✅ MOBILE: no fim, coloca "Voltar" no lugar do Próxima */}
                <button
                  type="button"
                  onClick={() => router.push("/forms")}
                  className={`sm:hidden px-4 py-2 rounded-lg text-sm font-medium transition w-full ${blueEnabled}`}
                >
                  Voltar para Formulários
                </button>

                {/* ✅ DESKTOP: mantém "Fim do formulário" desabilitado */}
                <button
                  type="button"
                  disabled
                  className={`hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium transition w-full sm:w-auto ${blueDisabled}`}
                >
                  Fim do formulário
                </button>
              </>
            )}
          </div>

          {/* Grupo direito */}
          <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-auto sm:flex sm:items-center sm:justify-end sm:gap-2">
            {/* ✅ Voltar normal (some no mobile quando estiver no fim, pra não duplicar) */}
            <button
              type="button"
              onClick={() => router.push("/forms")}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition w-full sm:w-auto ${blueEnabled} ${
                isLastPage ? "hidden sm:inline-flex" : ""
              }`}
            >
              Voltar para Formulários
            </button>

            <div className="col-span-2 sm:col-span-auto text-xs text-gray-600 sm:ml-2 min-w-[72px] text-center sm:text-right">
              {status === "saving"
                ? "Salvando..."
                : status === "saved"
                ? "Salvo"
                : status === "error"
                ? "Erro"
                : ""}
            </div>
          </div>
        </div>

        {/* Limpar (só a característica) */}
        <div className="mt-3 flex justify-start">
          <button
            type="button"
            onClick={openConfirm}
            className="px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition"
          >
            Limpar característica
          </button>
        </div>
      </div>

      {/* MODAL confirmar limpar */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar limpeza da característica"
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute inset-0 bg-black/40"
            onClick={closeConfirm}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Limpar esta característica?
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Isso vai apagar apenas as respostas desta característica.
            </p>

            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmClearCurrent}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              >
                Sim, limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
