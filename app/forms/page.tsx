// app/forms/page.tsx
"use client";

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

export default function FormsIndexPage() {
  const forms = getAllForms();

  return (
    <main className="mx-auto max-w-7xl p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold">Selecione um formulário</h1>
        <p className="mt-2 text-base text-gray-600">
          {forms.length} formulário{forms.length !== 1 ? "s" : ""} disponível
          {forms.length !== 1 ? "s" : ""}
        </p>
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
