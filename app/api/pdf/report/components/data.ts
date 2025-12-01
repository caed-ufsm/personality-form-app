// app/api/forms/pdf/report/data.ts
import rawExtroversao from "@/lib/feedbacks/extroversao.json";
import rawNeuroticismo from "@/lib/feedbacks/neuroticismo.json";
import rawAbertura from "@/lib/feedbacks/aberturarexp.json";
import rawAmabilidade from "@/lib/feedbacks/amabilidade.json";
import rawConscienciosidade from "@/lib/feedbacks/conscienciosidade.json";

// components/data.ts
export type TocFactorEntry = {
  label: string;
  page: number;      // 1-based
  facetas: string[];
};

/** ---------------- Tipos ---------------- */
export type FeedbackLevel = "baixo" | "medio" | "alto";

export type PerguntaFeedback = {
  id: string;
  texto: string;
  feedbacks: Record<FeedbackLevel, string>;
};

export type FeedbackConsolidado = {
  titulo: string;
  definicao: string;
  caracteristicas: string[];
  vantagens: string[];
  dificuldades: string[];
  estrategias: string[];
  conclusao: string;
};

export type Faceta = {
  descricao: string;
  perguntas: PerguntaFeedback[];
  feedbackConsolidado: Record<FeedbackLevel, FeedbackConsolidado>;
};

export type FeedbackForm = {
  titulo?: string;
  descricao?: string;
  facetas: Record<string, Faceta>;
};

export type OneForm = { id: string; answers: Record<string, number | string> };

export type FormKey =
  | "extroversao"
  | "neuroticismo"
  | "aberturarexperiencia"
  | "amabilidade"
  | "conscienciosidade";

/** ---------------- Dados ---------------- */
export const FEEDBACKS: Record<FormKey, FeedbackForm> = {
  extroversao: (rawExtroversao as any).Extroversao,
  neuroticismo: (rawNeuroticismo as any).Neuroticismo,
  aberturarexperiencia:
    (rawAbertura as any).AberturaExperiencia ??
    (rawAbertura as any)["AberturaExperiência"] ??
    (rawAbertura as any).default?.AberturaExperiencia ??
    (rawAbertura as any).default?.["AberturaExperiência"],
  amabilidade: (rawAmabilidade as any).Amabilidade,
  conscienciosidade: (rawConscienciosidade as any).Conscienciosidade,
};

/** ---------------- Utils / Resolvers ---------------- */
export function resolveFormKey(formId: string): FormKey | undefined {
  const f = formId
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_]/g, "")
    .replace(/v\d+$/, "");

  if (f.includes("neuro")) return "neuroticismo";
  if (f.includes("extrover")) return "extroversao";
  if (f.includes("amabil")) return "amabilidade";
  if (f.includes("consci")) return "conscienciosidade";
  if (f.includes("abertura") || f.includes("aberturarexp") || f.includes("experien"))
    return "aberturarexperiencia";

  return undefined;
}

/** --- ID resolvers --- */
export type IdResolver = (jsonId: string) => string | null;

const neuroticismoResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = +m[2];
  const offs: Record<string, number> = { N: 0, H: 6, D: 12, AC: 18, I: 24 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `n${off + num}`;
};

const extroversaoResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = +m[2];
  const offs: Record<string, number> = { A: 0, AS: 6, EP: 12 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `e${off + num}`;
};

const aberturaResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = +m[2];
  const offs: Record<string, number> = { F: 0, S: 6, AV: 12, V: 18 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `a${off + num}`; // "a" para bater com o storage atual
};

const amabilidadeResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = +m[2];
  const offs: Record<string, number> = { C: 0, FQ: 6, CP: 12, S: 18 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `a${off + num}`; // mantém igual ao seu código atual
};

const conscienciosidadeResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = +m[2];
  const offs: Record<string, number> = { AE: 0, OR: 6, AD: 12, PO: 18 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `c${off + num}`;
};

export const ID_RESOLVERS: Record<FormKey, IdResolver> = {
  neuroticismo: neuroticismoResolver,
  extroversao: extroversaoResolver,
  aberturarexperiencia: aberturaResolver,
  amabilidade: amabilidadeResolver,
  conscienciosidade: conscienciosidadeResolver,
};
