// app/forms/page.tsx
"use client";

import React from "react";
import Link from "next/link";
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

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

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

/** ---- Download helpers -------------------------------------------------- */

function extractFilenameFromContentDisposition(cd?: string | null) {
  if (!cd) return null;
  // filename*=UTF-8''nome.pdf  |  filename="nome.pdf"
  const utf8Match = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const plainMatch = cd.match(/filename\s*=\s*"?([^";]+)"?/i);
  return plainMatch?.[1] ?? null;
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** ---- Component --------------------------------------------------------- */

export default function FormsIndexPage() {
  const forms = React.useMemo<FormMeta[]>(() => getAllForms(), []);
  const [submitting, setSubmitting] = React.useState(false);

  const handleValidateAndSend = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    if (submitting) return;

    const ls = window.localStorage;

    type Incompleto = {
      id: string;
      title?: string;
      storageKey?: string | null;
      responded: number;
      expected?: number;
    };

    const incompletos: Incompleto[] = [];
    const payload: {
      forms: Array<{
        id: string;
        title?: string;
        storageKey: string;
        answers: Record<string, any>;
        responded: number;
        expected?: number;
      }>;
    } = { forms: [] };

    const allKeys = Array.from({ length: ls.length }, (_, i) => ls.key(i)).filter(
      Boolean
    );
    console.debug("[forms] localStorage keys:", allKeys);

    for (const f of forms) {
      const key = findStorageKeyForForm(f.id, ls);
      const raw = key ? ls.getItem(key) : null;
      const data = (safeParse<Record<string, any>>(raw) ?? {}) as Record<
        string,
        any
      >;

      const responded = countNonEmptyAnswers(data);
      const expected =
        typeof f.totalQuestions === "number" ? f.totalQuestions : undefined;

      const isComplete = expected != null ? responded >= expected : responded > 0;

      console.debug("[forms] check", {
        formId: f.id,
        formTitle: f.title,
        storageKey: key,
        responded,
        expected,
        isComplete,
        sample: Object.keys(data).slice(0, 5),
      });

      if (!isComplete) {
        incompletos.push({
          id: f.id,
          title: f.title,
          storageKey: key,
          responded,
          expected,
        });
      } else {
        payload.forms.push({
          id: f.id,
          title: f.title,
          storageKey: key ?? "(não encontrado)",
          answers: data,
          responded,
          expected,
        });
      }
    }

    if (incompletos.length > 0) {
      const lista = incompletos
        .map((it) => {
          const name = it.title ? `${it.title} (${it.id})` : it.id;
          const meta =
            it.expected != null
              ? `respondidas ${it.responded}/${it.expected}`
              : `respostas: ${it.responded}`;
          const keyInfo = it.storageKey ? ` [chave: ${it.storageKey}]` : " [sem chave]";
          return `• ${name}${keyInfo} — ${meta}`;
        })
        .join("\n");

      alert(
        "Alguns formulários estão incompletos (ou não foram encontrados no navegador):\n\n" +
          lista +
          "\n\nAbra cada formulário para finalizar o preenchimento."
      );
      return;
    }

    // ---- Envio ao backend e download do PDF -----------------------------
    const ENDPOINT_URL = "/api/pdf/report"; // <<<<<< AJUSTE AQUI
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000); // 60s

    try {
      setSubmitting(true);

      const res = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf,application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: "same-origin",
      });

      // Se o backend retornar JSON de erro, tente ler e exibir
      const contentType = res.headers.get("Content-Type") || "";
      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const err = await res.json().catch(() => null);
          const msg =
            (err && (err.message || err.error || JSON.stringify(err))) ||
            `Erro ${res.status}`;
          throw new Error(msg);
        }
        const text = await res.text().catch(() => "");
        throw new Error(text || `Erro ${res.status}`);
      }

      // Espera-se PDF
      if (!contentType.includes("application/pdf")) {
        // Se vier JSON de sucesso com link, trate aqui se quiser
        const maybeJson = await res.json().catch(() => null);
        if (maybeJson?.fileUrl) {
          window.location.href = maybeJson.fileUrl;
          alert("PDF gerado. Iniciando download pelo link retornado.");
          return;
        }
        throw new Error(
          "Resposta não é PDF. Verifique o endpoint ou o 'Content-Type'."
        );
      }

      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const filename =
        extractFilenameFromContentDisposition(cd) ||
        `respostas-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.pdf`;

      triggerDownload(filename, blob);
      alert("PDF gerado com sucesso! O download foi iniciado.");
    } catch (e: any) {
      if (e?.name === "AbortError") {
        alert("Tempo de espera excedido ao gerar o PDF. Tente novamente.");
      } else {
        console.error(e);
        alert(`Falha ao gerar PDF: ${e?.message || e}`);
      }
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  }, [forms, submitting]);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Selecione um formulário</h1>
        <p className="mt-2 text-base text-gray-600">
          {forms.length} formulário{forms.length !== 1 ? "s" : ""} disponível
          {forms.length !== 1 ? "s" : ""}
        </p>

        {/* Botão de validar/enviar (simulado -> agora envia e baixa PDF) */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleValidateAndSend}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0353a3] px-5 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-800"
            disabled={forms.length === 0 || submitting}
            title="Valida os formulários no navegador e gera o PDF (download)"
          >
            {submitting ? "Gerando PDF..." : "Validar e enviar respostas"}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            O sistema verifica os rascunhos salvos no navegador e envia ao servidor.
            Se tudo certo, o PDF é gerado e baixado automaticamente.
          </p>
        </div>
      </header>

      {forms.length === 0 ? (
        <p className="text-lg text-gray-500">Nenhum formulário cadastrado.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
          {forms.map((f) => (
            <li
              key={f.id}
              className="flex flex-col rounded-2xl border-2 bg-white/90 p-6 shadow-md transition hover:shadow-xl"
              style={{ borderColor: f.themeColor ?? "#e5e7eb" }}
            >
              {/* Header: ícone + título */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: (f.themeColor ?? "#e5e7eb") + "22" }}
                >
                  <span aria-hidden>{f.iconEmoji ?? "📝"}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-600">{f.title}</h2>
                  {f.subtitle && (
                    <p className="text-base text-gray-600">{f.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Body */}
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

              {/* Meta */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                {typeof f.estimatedMinutes === "number" && (
                  <span>⏱ {f.estimatedMinutes} min</span>
                )}
                {typeof f.totalQuestions === "number" && (
                  <span>❓ {f.totalQuestions} perguntas</span>
                )}
                {f.versionLabel && <span>📌 {f.versionLabel}</span>}
                {f.lastUpdatedISO && <span>🗓 {formatDate(f.lastUpdatedISO)}</span>}
                {f.author && <span>👤 {f.author}</span>}
              </div>

              {/* Footer: ação */}
              <div className="mt-8">
                <Link
                  href={`/forms/${f.id}`}
                  className="inline-block rounded-lg bg-[#0353a3] px-6 py-3 text-base font-medium text-white transition hover:bg-blue-800"
                >
                  Abrir formulário
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
