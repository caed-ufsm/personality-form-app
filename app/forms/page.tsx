"use client";

import React from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { getAllForms } from "./lib/registry";

/** ---- Types ------------------------------------------------------------- */
type Nullable<T> = T | null | undefined;

interface FormMeta {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  estimatedMinutes?: number;
  totalQuestions?: number;
  versionLabel?: string;
  lastUpdatedISO?: string;
  author?: string;
  iconEmoji?: string;
  themeColor?: string;
}

/** ---- Utils ------------------------------------------------------------- */
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
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return true;
    if (typeof v === "boolean") return v === true;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return false;
  }).length;
}

/** ---- Component --------------------------------------------------------- */
export default function FormsIndexPage() {
  const forms = React.useMemo<FormMeta[]>(() => getAllForms(), []);
  const [allComplete, setAllComplete] = React.useState(false);
  const [hcaptchaToken, setHcaptchaToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const ls = window.localStorage;

    const allDone = forms.every((f) => {
      const key = findStorageKeyForForm(f.id, ls);
      const raw = key ? ls.getItem(key) : null;
      const data = safeParse<Record<string, any>>(raw) ?? {};
      const responded = countNonEmptyAnswers(data);
      const expected =
        typeof f.totalQuestions === "number" ? f.totalQuestions : undefined;
      return expected != null ? responded >= expected : responded > 0;
    });

    setAllComplete(allDone);
  }, [forms]);

  const handleSend = async () => {
    if (!allComplete) {
      alert("⚠️ Você precisa responder todos os formulários antes de enviar.");
      return;
    }
    if (!hcaptchaToken) {
      alert("⚠️ Valide o hCaptcha antes de continuar.");
      return;
    }

    setIsLoading(true);

    try {
      const ls = window.localStorage;
      const sessionId =
        localStorage.getItem("sessionId") || crypto.randomUUID();
      localStorage.setItem("sessionId", sessionId);

      // 🔹 Coleta todos os formulários e respostas
      const results: Record<string, any> = {};
      for (const f of forms) {
        const key = findStorageKeyForForm(f.id, ls);
        const raw = key ? ls.getItem(key) : null;
        const answers = safeParse<Record<string, any>>(raw) ?? {};
        results[f.id] = answers;
      }

      // 🔹 Envia ao banco de dados
      const saveRes = await fetch("/api/forms/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, results }),
      });

      if (!saveRes.ok) {
        throw new Error("Falha ao salvar no banco de dados.");
      }

      // 🔹 Gera o PDF
      const res = await fetch("/api/pdf/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          forms: Object.entries(results).map(([id, answers]) => ({
            id,
            answers,
          })),
          hcaptchaToken,
          requestId: crypto.randomUUID(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Erro desconhecido ao gerar PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio-consolidado.pdf";
      a.click();
      URL.revokeObjectURL(url);

      alert("✅ PDF gerado e respostas salvas com sucesso!");
    } catch (err: any) {
      console.error(err);
      alert("❌ Ocorreu um erro: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Selecione um formulário</h1>
        <p className="mt-2 text-base text-gray-600">
          {forms.length} formulário{forms.length !== 1 ? "s" : ""} disponível
          {forms.length !== 1 ? "s" : ""}.
        </p>

        <div className="mt-8 rounded-2xl bg-blue-50 p-6 border border-blue-200 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Complete todos os formulários para gerar seu relatório personalizado
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Ao responder todos os formulários, você poderá gerar um{" "}
            <strong>PDF completo e personalizado</strong> com os resultados consolidados.
            Esse relatório apresentará seus principais{" "}
            <strong>pontos de vantagem potenciais</strong>,{" "}
            <strong>características estratégicas</strong> e{" "}
            <strong>oportunidades de desenvolvimento</strong>, com base nas suas respostas.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Portanto, responda com atenção e sinceridade — suas respostas servirão de base
            para a criação de um diagnóstico detalhado e de um material de apoio valioso
            para o seu crescimento pessoal e profissional.
          </p>
        </div>
      </header>

      {/* Lista de formulários */}
      {forms.length === 0 ? (
        <p className="text-lg text-gray-500">Nenhum formulário cadastrado.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {forms.map((f) => {
            let isComplete = false;
            if (typeof window !== "undefined") {
              const ls = window.localStorage;
              const key = findStorageKeyForForm(f.id, ls);
              const raw = key ? ls.getItem(key) : null;
              const data = safeParse<Record<string, any>>(raw) ?? {};
              const responded = countNonEmptyAnswers(data);
              const expected =
                typeof f.totalQuestions === "number" ? f.totalQuestions : undefined;
              isComplete = expected != null ? responded >= expected : responded > 0;
            }

            return (
              <li
                key={f.id}
                className="flex flex-col rounded-2xl border-2 bg-white/90 p-6 shadow-md transition hover:shadow-xl"
                style={{ borderColor: f.themeColor ?? "#e5e7eb" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                    style={{ background: (f.themeColor ?? "#e5e7eb") + "22" }}
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
                  <p className="mt-4 text-base text-gray-700">{f.description}</p>
                )}

                {f.tags && f.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border px-3 py-1 text-sm text-gray-700"
                        style={{ borderColor: f.themeColor ?? "#e5e7eb" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                  {typeof f.estimatedMinutes === "number" && (
                    <span>⏱ {f.estimatedMinutes} min</span>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
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
                      ✅ Concluído
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Área final de envio */}
      <section className="mt-16 border-t pt-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Enviar todos os formulários
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Após concluir todos os formulários, suas respostas serão enviadas
            de forma anônima e seguras para gerar um{" "}
            <strong>relatório consolidado</strong> com{" "}
            <strong>análises automáticas</strong>,{" "}
            <strong>pontos de vantagem</strong> e{" "}
            <strong>estratégias personalizadas</strong>.
          </p>

          <div className="flex flex-col items-center gap-4">
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
              onVerify={(token) => setHcaptchaToken(token)}
            />

            <button
              onClick={handleSend}
              disabled={!allComplete || !hcaptchaToken || isLoading}
              className={`rounded-lg px-8 py-4 text-lg font-semibold text-white transition ${
                allComplete && hcaptchaToken && !isLoading
                  ? "bg-[#0353a3] hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "⏳ Enviando e gerando PDF..." : "📤 Enviar e gerar PDF completo"}
            </button>

            {!allComplete && (
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Você ainda não respondeu todos os formulários.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
