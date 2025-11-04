// app/api/forms/[formId]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getFormDefinition } from "../../../forms/lib/registry";
import { schemaFromConfig } from "../../../forms/lib/schemaFromConfig";
import type { FormDefinition } from "../../../forms/lib/types";

type AnswersById = Record<string, number>;
type CategoriesPayload = Record<string, Record<string, number>>;

// Normaliza payloads para { [questionId]: number }
function normalizePayload(
  body: any,
  allIds: string[],
  categoryKeys: string[]
): { ok: true; data: AnswersById } | { ok: false; reason: string } {
  if (body && typeof body === "object" && body.categories && typeof body.categories === "object") {
    const categories = body.categories as CategoriesPayload;
    const out: AnswersById = {};
    for (const [catKey, group] of Object.entries(categories)) {
      if (!categoryKeys.includes(catKey)) {
        return { ok: false, reason: `Categoria desconhecida: "${catKey}"` };
      }
      if (typeof group !== "object" || group == null) {
        return { ok: false, reason: `Formato inválido em categories["${catKey}"]` };
      }
      for (const [qid, val] of Object.entries(group)) {
        if (!allIds.includes(qid)) return { ok: false, reason: `Pergunta desconhecida: "${qid}"` };
        out[qid] = Number(val);
      }
    }
    return { ok: true, data: out };
  }

  if (body && typeof body === "object" && Object.keys(body).some((k) => allIds.includes(k))) {
    const out: AnswersById = {};
    for (const id of allIds) {
      if (id in body) out[id] = Number(body[id]);
    }
    return { ok: true, data: out };
  }

  if (body && Array.isArray(body.answers)) {
    const arr = body.answers as unknown[];
    if (arr.length !== allIds.length) {
      return { ok: false, reason: `answers[] tamanho inválido: esperado ${allIds.length}, recebido ${arr.length}` };
    }
    const out: AnswersById = {};
    arr.forEach((v, i) => (out[allIds[i]] = Number(v)));
    return { ok: true, data: out };
  }

  const qKeys = Object.keys(body ?? {}).filter((k) => /^q\d+$/i.test(k));
  if (qKeys.length > 0) {
    const ordered = qKeys
      .map((k) => [k, Number(k.slice(1))] as const)
      .sort((a, b) => a[1] - b[1])
      .map(([k]) => k);

    if (ordered.length !== allIds.length) {
      return { ok: false, reason: `q1..qN tamanho inválido: esperado ${allIds.length}, recebido ${ordered.length}` };
    }
    const out: AnswersById = {};
    ordered.forEach((qKey, i) => (out[allIds[i]] = Number(body[qKey])));
    return { ok: true, data: out };
  }

  return { ok: false, reason: "Formato de payload não reconhecido" };
}

// Agrupa por categoria
function groupByCategory(def: FormDefinition, byId: AnswersById) {
  const byCategory: Record<string, AnswersById> = {};
  for (const cat of def.categories) {
    const group: AnswersById = {};
    for (const q of cat.questions) {
      if (q.id in byId) group[q.id] = byId[q.id];
    }
    byCategory[cat.key] = group;
  }
  return byCategory;
}

// Médias por categoria
function categoryAverages(def: FormDefinition, byCategory: Record<string, AnswersById>) {
  const avgs: Record<string, number> = {};
  for (const cat of def.categories) {
    const vals = Object.values(byCategory[cat.key] ?? {});
    avgs[cat.key] = vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3)) : 0;
  }
  return avgs;
}



export async function POST(req: NextRequest, context: { params: Promise<{ formId: string }> }) {
  try {
    // ✅ Novo formato (precisa do await)
    const { formId } = await context.params;

    const def = getFormDefinition(formId);
    if (!def) {
      return NextResponse.json({ ok: false, message: `Formulário não encontrado: ${formId}` }, { status: 404 });
    }

    const { strict, allIds } = schemaFromConfig(def);
    const body = await req.json().catch(() => ({}));

    const normalized = normalizePayload(body, allIds, def.categories.map((c) => c.key));
    if (!normalized.ok) {
      return NextResponse.json(
        { ok: false, message: "Payload inválido", reason: normalized.reason },
        { status: 400 }
      );
    }

    const parsed = strict.safeParse(normalized.data);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      return NextResponse.json(
        { ok: false, message: "Validação falhou", errors: flat.fieldErrors },
        { status: 422 }
      );
    }

    const answersById = parsed.data as Record<string, number>;
    const byCategory = groupByCategory(def, answersById);
    const averages = categoryAverages(def, byCategory);

    return NextResponse.json(
      {
        ok: true,
        formId,
        message: "Formulário recebido",
        data: { byId: answersById, byCategory, categoryAverages: averages },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[/api/forms/[formId]] error:", err);
    return NextResponse.json({ ok: false, message: "Erro interno" }, { status: 500 });
  }
}