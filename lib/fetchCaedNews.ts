// lib/fetchCaedNews.ts
import Parser from "rss-parser";

export type CaedNews = {
  id: string;
  title: string;
  href: string;      // absoluto p/ usar no componente
  link?: string;     // mantido p/ compatibilidade (pode remover depois)
  date: string;
  summary?: string;
};

const CAED_RSS =
  "https://www.ufsm.br/pro-reitorias/prograd/caed/busca/?area=post&q=&rss=true&sites%5B%5D=391";

const UFSM_BASE = "https://www.ufsm.br";

function toAbsolute(url?: string): string {
  if (!url) return "#";
  try {
    return new URL(url, UFSM_BASE).toString(); // resolve /pro-reitorias/...
  } catch {
    return "#";
  }
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function fetchCaedNews(limit = 6): Promise<CaedNews[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(CAED_RSS);

  return (feed.items ?? []).slice(0, limit).map((it, i) => {
    const absolute = toAbsolute(it.link);
    return {
      id: it.guid || it.link || String(i),
      title: it.title || "Sem título",
      href: absolute,       // <- use SEMPRE este no componente
      link: absolute,       // <- mantém por compat
      date: it.isoDate || it.pubDate || "",
      summary: stripHtml(it.contentSnippet || it.content || ""),
    };
  });
}
