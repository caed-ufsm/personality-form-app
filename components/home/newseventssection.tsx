// components/NewsEventsSection.tsx
import React from "react";

export type NewsItem = {
  id: string;
  title: string;
  date: string; // ISO ou dd/mm/aaaa
  summary?: string;
  href?: string;  // pode vir do fetch
  link?: string;  // compat, caso ainda venha assim
};

function normalizeExternal(url?: string) {
  if (!url) return "#";
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `https://www.ufsm.br${path}`;
}

export default function NewsEventsSection({
  title = "Notícias & Eventos",
  items = [],
}: {
  title?: string;
  items?: NewsItem[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma notícia encontrada.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => {
            const dateFormatted = n.date
              ? new Date(n.date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "";

            const href = normalizeExternal(n.href ?? n.link);

            return (
              <li key={n.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md"
                >
                  <div>
                    <time className="text-xs text-gray-500">{dateFormatted}</time>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {n.title}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                      {n.summary || "Sem resumo disponível."}
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
