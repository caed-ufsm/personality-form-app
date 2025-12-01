// app/api/forms/pdf/report/scoring.ts
import type { FeedbackLevel, PerguntaFeedback, FormKey } from "./data";
import { ID_RESOLVERS } from "./data";

/** ---------------- Helpers ---------------- */
export function toNumber(v: any): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return undefined;
}

export function getAnswerFor(
  formKey: FormKey,
  pergunta: { id: string; texto: string },
  answers: Record<string, any>
): number | undefined {
  // 1) tenta pelo id exato do JSON
  if (pergunta.id in answers) {
    const v = toNumber(answers[pergunta.id]);
    if (v !== undefined) return v;
  }

  // 2) tenta pelo id mapeado (storage)
  const mapped = ID_RESOLVERS[formKey](pergunta.id);
  if (mapped && mapped in answers) {
    const v = toNumber(answers[mapped]);
    if (v !== undefined) return v;
  }

  // 3) tenta case-insensitive (segurança)
  const lower = new Map<string, string>(
    Object.keys(answers).map((k) => [k.toLowerCase(), k])
  );

  for (const k of [pergunta.id, mapped].filter(Boolean) as string[]) {
    const real = lower.get(k.toLowerCase());
    if (real) {
      const v = toNumber(answers[real]);
      if (v !== undefined) return v;
    }
  }

  return undefined;
}

/** ---------------- Reversão (mantém compatível com o seu comportamento atual) ---------------- */
const REVERSE_TAG = /^\s*\[R\]\s*/i;

function shouldReverse(pergunta: { id: string; texto: string }, idx: number, total: number) {
  // Se existir tag [R] no texto/id, reverte.
  if (REVERSE_TAG.test(pergunta.texto) || REVERSE_TAG.test(pergunta.id)) return true;

  // Fallback compatível com seu código atual: reverte a última pergunta.
  return idx === total - 1;
}

/** ---------------- Cálculo ---------------- */
export function calcularMediaFaceta(
  formKey: FormKey,
  perguntas: PerguntaFeedback[],
  answers: Record<string, any>
): number | null {
  const vals: number[] = [];

  for (let i = 0; i < perguntas.length; i++) {
    const raw = getAnswerFor(formKey, perguntas[i], answers);
    if (typeof raw !== "number") continue;

    const v = shouldReverse(perguntas[i], i, perguntas.length) ? 6 - raw : raw;
    vals.push(v);
  }

  if (!vals.length) return null;
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
}

export function nivelPorMedia(media: number | null): FeedbackLevel {
  if (media == null) return "medio";
  if (media >= 1 && media <= 2.99) return "baixo";
  if (media >= 3 && media <= 3.99) return "medio";
  return "alto";
}
