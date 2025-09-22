// app/forms/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { getAllForms } from "./lib/registry";

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

/** normaliza para comparar ids/keys (minúsculas, sem acentos, com hífens) */
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function safeParse<T = any>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** tenta casar um formId com uma key do localStorage (aceita sufixos de versão) */
function findStorageKeyForForm(formId: string, ls: Storage): string | null {
  const formSlug = slugify(formId);

  // 1) Igual exato
  const exact = ls.getItem(formId);
  if (exact != null) return formId;

  // 2) Varre todas as keys e casa por slug (startsWith / includes)
  let best: { key: string; score: number } | null = null;

  for (let i = 0; i < ls.length; i++) {
    const key = ls.key(i);
    if (!key) continue;

    const keySlug = slugify(key);

    // Pontuação: prioriza startsWith(formSlug) e menor diferença de comprimento
    let score = -1;
    if (keySlug === formSlug) score = 100;
    else if (keySlug.startsWith(formSlug + "-")) score = 90;
    else if (keySlug.includes(formSlug)) score = 70;
    else if (formSlug.startsWith(keySlug)) score = 60;

    if (score > -1) {
      // desempate por “proximidade” de tamanho
      const proximity = Math.abs(keySlug.length - formSlug.length);
      const finalScore = score - Math.min(proximity, 30);
      if (!best || finalScore > best.score) {
        best = { key, score: finalScore };
      }
    }
  }

  return best?.key ?? null;
}

/** conta respostas não vazias (strings com conteúdo, números, booleanos true) */
function countNonEmptyAnswers(obj: Record<string, any>): number {
  return Object.values(obj).filter((v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return true;
    if (typeof v === "boolean") return v === true;
    // arrays/objetos: conta se tem conteúdo
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return false;
  }).length;
}

export default function FormsIndexPage() {
  const forms = getAllForms();

  const handleValidateAndSend = React.useCallback(() => {
    if (typeof window === "undefined") return;

    const ls = window.localStorage;
    const incompletos: Array<{
      id: string;
      title?: string;
      storageKey?: string | null;
      responded: number;
      expected?: number;
    }> = [];
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

    // Debug: lista todas as keys do LS
    const allKeys = Array.from({ length: ls.length }, (_, i) => ls.key(i)).filter(Boolean);
    console.debug("[forms] localStorage keys:", allKeys);

    for (const f of forms) {
      const key = findStorageKeyForForm(f.id, ls);
      const raw = key ? ls.getItem(key) : null;
      const data = safeParse<Record<string, any>>(raw) ?? {};
      const responded = countNonEmptyAnswers(data);
      const expected =
        typeof f.totalQuestions === "number" ? f.totalQuestions : undefined;

      // considera completo quando há expected e responded >= expected
      // se não houver expected, considera completo se houver pelo menos 1 resposta
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

    // Tudo completo -> simula o envio (apenas print)
    console.log(">>> ENVIAR PARA BACKEND (simulação) <<<");
    console.log(payload);

    alert("Formulários completos! Simulando envio (veja o console).");
  }, [forms]);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Selecione um formulário</h1>
        <p className="mt-2 text-base text-gray-600">
          {forms.length} formulário{forms.length !== 1 ? "s" : ""} disponível
          {forms.length !== 1 ? "s" : ""}
        </p>

        {/* Botão de validar/enviar (simulado) */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleValidateAndSend}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0353a3] px-5 py-3 text-base font-semibold text-white shadow transition hover:bg-blue-800"
            disabled={forms.length === 0}
            title="Valida os formulários no navegador e simula o envio"
          >
            Validar e enviar respostas
          </button>
          <p className="mt-2 text-sm text-gray-500">
            O sistema verifica os rascunhos salvos no navegador. Se estiver tudo OK,
            apenas fará um <code>console.log</code> com o payload.
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
                {f.lastUpdatedISO && (
                  <span>🗓 {formatDate(f.lastUpdatedISO)}</span>
                )}
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
