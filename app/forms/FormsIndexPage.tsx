"use client";

import React from "react";
import Link from "next/link";
import { getAllForms } from "./lib/registry";

type FormListItem = { id: string; title: string };

const FORM_ORDER = [
  "neuroticismo",
  "extroversao",
  "aberturaexperiencia",
  "amabilidade",
  "conscienciosidade",
];

function sortFormsByOrder<T extends FormListItem>(forms: T[], order: string[]) {
  const index = new Map(order.map((id, i) => [id, i]));

  return [...forms].sort((a, b) => {
    const ai = index.has(a.id)
      ? (index.get(a.id) as number)
      : Number.POSITIVE_INFINITY;
    const bi = index.has(b.id)
      ? (index.get(b.id) as number)
      : Number.POSITIVE_INFINITY;

    if (ai !== bi) return ai - bi;

    return a.title.localeCompare(b.title, "pt-BR", { sensitivity: "base" });
  });
}

export default function FormsIndexPage() {
  /** ---------------- CLIENT MOUNT ---------------- */
  const [mounted, setMounted] = React.useState(false);
  const [forms, setForms] = React.useState<any[]>([]);

  React.useEffect(() => {
    setMounted(true);

    // Carrega forms apenas no cliente
    const loaded = getAllForms();
    setForms(loaded);
  }, []);

  /** ---------------- ORDERED LIST ---------------- */
  const sortedForms = React.useMemo(() => {
    return sortFormsByOrder(forms as FormListItem[], FORM_ORDER);
  }, [forms]);

  /** ---------------- STATES ---------------- */
  const [allComplete, setAllComplete] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const [completionMap, setCompletionMap] = React.useState<
    Record<string, boolean>
  >({});

  /** ---------------- UTILS ---------------- */
  type Nullable<T> = T | null | undefined;

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function safeParse<T = any>(raw: Nullable<string>): T | null {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  function scoreKeyMatch(formSlug: string, keySlug: string) {
    if (keySlug === formSlug) return 100;
    if (keySlug.startsWith(formSlug + "-")) return 90;
    if (keySlug.includes(formSlug)) return 70;
    if (formSlug.startsWith(keySlug)) return 60;
    return -1;
  }

  function findStorageKeyForForm(formId: string, ls: Storage): string | null {
    const formSlug = slugify(formId);
    const exact = ls.getItem(formId);
    if (exact != null) return formId;

    let best: { key: string; score: number } | null = null;

    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (!key) continue;

      const keySlug = slugify(key);
      const baseScore = scoreKeyMatch(formSlug, keySlug);
      if (baseScore < 0) continue;

      const proximity = Math.abs(keySlug.length - formSlug.length);
      const finalScore = baseScore - Math.min(proximity, 30);

      if (!best || finalScore > best.score) best = { key, score: finalScore };
    }

    return best?.key ?? null;
  }

  function countNonEmptyAnswers(obj: Record<string, any>): number {
    return Object.values(obj).filter((v) => {
      if (v == null) return false;
      if (typeof v === "string") return v.trim().length > 0;
      if (typeof v === "number") return true;
      if (typeof v === "boolean") return v === true;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object") return Object.keys(v).length > 0;
      return false;
    }).length;
  }

  /** ---------------- CALCULATE COMPLETION ---------------- */
  React.useEffect(() => {
    if (!mounted || sortedForms.length === 0) return;

    const ls = window.localStorage;
    const status: Record<string, boolean> = {};

    sortedForms.forEach((f) => {
      const key = findStorageKeyForForm(f.id, ls);
      const raw = key ? ls.getItem(key) : null;
      const data = safeParse<Record<string, any>>(raw) ?? {};

      const responded = countNonEmptyAnswers(data);
      const expected =
        typeof (f as any).totalQuestions === "number"
          ? (f as any).totalQuestions
          : undefined;

      status[f.id] = expected ? responded >= expected : responded > 0;
    });

    setCompletionMap(status);
    setAllComplete(Object.values(status).every(Boolean));
  }, [mounted, sortedForms]);

  /** ---------------- HANDLE SEND ---------------- */
  const handleSend = async () => {
    if (!allComplete) {
      alert("⚠️ Você precisa responder todos os formulários antes de enviar.");
      return;
    }

    setIsLoading(true);

    try {
      const ls = window.localStorage;

      // Garante que a sessão existe
      const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);

      /** --------------------------------------------------------
       * 1. Montar resultados do localStorage (objeto)
       * -------------------------------------------------------- */
      const results: Record<string, any> = {};

      for (const f of sortedForms) {
        const key = findStorageKeyForForm(f.id, ls);
        const raw = key ? ls.getItem(key) : null;
        results[f.id] = safeParse(raw) ?? {};
      }

      /** --------------------------------------------------------
       * 2. Enviar para o banco (API: /api/forms/save)
       * -------------------------------------------------------- */
      const saveRes = await fetch("/api/forms/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, results }),
      });

      if (!saveRes.ok) throw new Error("Falha ao salvar no banco.");

      /** --------------------------------------------------------
       * 3. Transformar results → array {id, answers}
       *    Formato exigido pela rota /api/pdf/report
       * -------------------------------------------------------- */
      const pdfPayload = {
        forms: Object.entries(results).map(([id, answers]) => ({
          id,
          answers,
        })),
      };

      /** --------------------------------------------------------
       * 4. Gerar PDF (API: /api/pdf/report)
       * -------------------------------------------------------- */
      const pdfRes = await fetch("/api/pdf/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(pdfPayload),
      });

      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({}));
        console.error("PDF ERROR:", err);
        throw new Error("Erro ao gerar PDF.");
      }

      /** --------------------------------------------------------
       * 5. Baixar o PDF
       * -------------------------------------------------------- */
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-consolidado.pdf";
      a.click();
      URL.revokeObjectURL(url);

      alert("✅ PDF gerado com sucesso!");
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  /** ---------------- SAFE RENDER ---------------- */
  if (!mounted) {
    return (
      <div className="p-10 text-center text-gray-500">
        Carregando formulários...
      </div>
    );
  }

  /** ------------------ RENDER ------------------ */
  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* HEADER --------------------------------------------------------- */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Selecione um formulário</h1>

        <p className="mt-2 text-base text-gray-600">
          {sortedForms.length} formulário{sortedForms.length !== 1 ? "s" : ""}{" "}
          disponível{sortedForms.length !== 1 ? "s" : ""}.
        </p>

        {/* MOBILE DROPDOWN */}
        <div className="mt-8 rounded-2xl bg-blue-50 p-6 border border-blue-200 shadow-sm">
          <button
            className="md:hidden w-full text-left flex justify-between items-center text-xl font-semibold text-blue-900 mb-3"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            <span>
              Complete todos os formulários para gerar seu relatório
              personalizado
            </span>

            <svg
              className={`w-6 h-6 transition-transform ${
                showInfo ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* DESKTOP TITLE */}
          <h2 className="hidden md:block text-xl font-semibold text-blue-900 mb-3">
            Complete todos os formulários para gerar seu relatório personalizado
          </h2>

          {/* CONTENT */}
          <div
            className={`
              overflow-hidden transition-all duration-300
              ${
                showInfo
                  ? "max-h-[600px] opacity-100"
                  : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
              }
            `}
          >
            <p className="text-gray-700 leading-relaxed">
              Ao responder todos os formulários, você poderá gerar um{" "}
              <strong>PDF completo e personalizado</strong> com os resultados
              consolidados. Esse relatório apresentará suas principais
              características, vantagens potenciais, dificuldades potenciais e
              estratégias com base nas suas respostas.
            </p>

            <p className="text-gray-700 leading-relaxed mt-3">
              Portanto, responda com atenção e sinceridade — suas respostas
              servirão de base para a criação de um panorama detalhado e de um
              material de apoio valioso para o seu crescimento pessoal e
              profissional.
            </p>
          </div>
        </div>
      </header>

      {/* LISTA DE FORMULÁRIOS ------------------------------------------------- */}
      {sortedForms.length === 0 ? (
        <p className="text-lg text-gray-500">Nenhum formulário cadastrado.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {sortedForms.map((f: any) => {
            const isComplete = completionMap[f.id] ?? false;

            return (
              <li
                key={f.id}
                className="flex flex-col rounded-2xl border-2 bg-white/90 p-5 shadow-md transition hover:shadow-xl"
                style={{ borderColor: f.themeColor ?? "#e5e7eb" }}
              >
                {/* MOBILE */}
                <div className="md:hidden">
                  <button
                    onClick={() =>
                      setOpen((prev) => ({ ...prev, [f.id]: !prev[f.id] }))
                    }
                    className="w-full flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                        style={{
                          background: (f.themeColor ?? "#e5e7eb") + "22",
                        }}
                      >
                        <span aria-hidden>{f.iconEmoji ?? "📝"}</span>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {f.title}
                        </h2>
                        {f.subtitle && (
                          <p className="text-sm text-gray-600">{f.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {!isComplete ? (
                      <svg
                        className={`w-6 h-6 text-gray-700 transition-transform ${
                          open[f.id] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    ) : (
                      <span className="text-green-600 font-semibold text-sm ml-2">
                        ✔️ Concluído
                      </span>
                    )}
                  </button>

                  {open[f.id] && (
                    <div className="mt-4">
                      {f.description && (
                        <p className="text-base text-gray-700 mb-4">
                          {f.description}
                        </p>
                      )}

                      {typeof f.estimatedMinutes === "number" && (
                        <p className="text-sm text-gray-600 mb-4">
                          ⏱ {f.estimatedMinutes} min
                        </p>
                      )}

                      <div className="flex flex-col gap-3">
                        <Link
                          href={`/forms/${f.id}`}
                          className="inline-block rounded-lg bg-[#0353a3] px-6 py-3 text-base font-medium text-white transition hover:bg-blue-800"
                        >
                          Abrir formulário
                        </Link>

                        {isComplete && (
                          <span className="inline-block rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white text-center opacity-90">
                            ✔️ Concluído
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* DESKTOP */}
                <div className="hidden md:flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                      style={{
                        background: (f.themeColor ?? "#e5e7eb") + "22",
                      }}
                    >
                      <span aria-hidden>{f.iconEmoji ?? "📝"}</span>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {f.title}
                      </h2>
                      {f.subtitle && (
                        <p className="text-base text-gray-600">{f.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {f.description && (
                    <p className="text-base text-gray-700">{f.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    {typeof f.estimatedMinutes === "number" && (
                      <span>⏱ {f.estimatedMinutes} min</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/forms/${f.id}`}
                      className="inline-block rounded-lg bg-[#0353a3] px-6 py-3 text-base font-medium text-white transition hover:bg-blue-800"
                    >
                      Abrir formulário
                    </Link>

                    {isComplete && (
                      <button
                        disabled
                        className="inline-block rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white cursor-default opacity-90"
                      >
                        ✔️ Concluído
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ÁREA FINAL DE ENVIO -------------------------------------------------- */}
      <section className="mt-16 border-t pt-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Enviar todos os formulários
          </h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            Após concluir todos os formulários, suas respostas serão enviadas de
            forma anônima e segura para gerar um{" "}
            <strong>relatório personalizado</strong>
          </p>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleSend}
              disabled={!allComplete || isLoading}
              className={`rounded-lg px-8 py-4 text-lg font-semibold text-white transition ${
                allComplete && !isLoading
                  ? "bg-[#0353a3] hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading
                ? "⏳ Enviando e gerando PDF..."
                : "📤 Enviar e gerar PDF completo"}
            </button>

            {!allComplete && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Você ainda não respondeu todos os formulários.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
