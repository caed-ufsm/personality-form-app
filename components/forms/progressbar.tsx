"use client";

import React from "react";
import { UFSM_BLUE } from "../../app/forms/lib/theme";

type Props = { progress: number; filledCount: number; total: number; page: number; numPages: number };

export default function ProgressBar({ progress, filledCount, total, page, numPages }: Props) {
  return (
    <div className="mb-4">
      <div className="h-2 bg-gray-200 rounded overflow-hidden">
        <div className="h-full" style={{ width: `${progress}%`, background: UFSM_BLUE }} />
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Progresso: {filledCount}/{total} — Página {page + 1} de {numPages}
      </div>
    </div>
  );
}
