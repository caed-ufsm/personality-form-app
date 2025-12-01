// app/api/pdf/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildPdfReport } from "./pdf-builder";
import type { OneForm } from "./components/data";

/** ---------------- Rate limit / Idempotência (in-memory) ---------------- */
type Bucket = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __rateBuckets__pdfReport: Map<string, Bucket> | undefined;
  // eslint-disable-next-line no-var
  var __idemKeys__pdfReport: Map<string, number> | undefined;
}

const buckets = globalThis.__rateBuckets__pdfReport ?? new Map<string, Bucket>();
globalThis.__rateBuckets__pdfReport = buckets;

const idemKeys = globalThis.__idemKeys__pdfReport ?? new Map<string, number>();
globalThis.__idemKeys__pdfReport = idemKeys;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const IDEM_TTL_MS = 2 * 60_000;

/** ---------------- Helpers ---------------- */
function jsonError(message: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers });
}

function getClientIp(req: NextRequest) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function checkRate(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);

  if (!b || b.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_MAX - 1, retryAfter: RATE_WINDOW_MS / 1000 };
  }

  if (b.count >= RATE_MAX) {
    return { allowed: false, remaining: 0, retryAfter: Math.max(0, Math.ceil((b.resetAt - now) / 1000)) };
  }

  b.count += 1;
  return { allowed: true, remaining: RATE_MAX - b.count, retryAfter: Math.max(0, Math.ceil((b.resetAt - now) / 1000)) };
}

function pruneIdempotency() {
  const now = Date.now();
  for (const [k, ts] of idemKeys) if (now - ts > IDEM_TTL_MS) idemKeys.delete(k);
}

function checkIdempotency(key?: string | null) {
  if (!key) return { duplicate: false as const };
  pruneIdempotency();
  if (idemKeys.has(key)) return { duplicate: true as const };
  idemKeys.set(key, Date.now());
  return { duplicate: false as const };
}

async function readJsonBody(req: NextRequest): Promise<any> {
  // Mantém seu comportamento: body vazio vira {}
  const raw = await req.text();
  return raw ? JSON.parse(raw) : {};
}

function normalizeForms(body: any): OneForm[] | null {
  // Payload: { forms } OU { formId, answers }
  if (Array.isArray(body?.forms) && body.forms.length) {
    const forms = body.forms
      .map((f: any) => ({
        id: String(f?.id || ""),
        answers: f?.answers || {},
      }))
      .filter((f: OneForm) => f.id && f.answers && typeof f.answers === "object");

    return forms.length ? forms : null;
  }

  if (body?.formId && body?.answers && typeof body.answers === "object") {
    return [
      {
        id: String(body.formId),
        answers: body.answers as Record<string, number | string>,
      },
    ];
  }

  return null;
}

function pdfResponse(bytes: Uint8Array, idemKey?: string | null) {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);

  const headers: Record<string, string> = {
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="relatorio-personalizado.pdf"',
    "Content-Length": String(bytes.byteLength),
  };
  if (idemKey) headers["Idempotency-Key"] = idemKey;

  return new Response(ab, { status: 200, headers });
}

/** ---------------- Handler ---------------- */
export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(req);
    const rate = checkRate(ip);
    if (!rate.allowed) {
      return jsonError("Muitas requisições. Tente novamente em instantes.", 429, {
        "Retry-After": String(rate.retryAfter),
      });
    }

    // Body + Idempotência
    const idemHeader = req.headers.get("idempotency-key");
    const body = await readJsonBody(req);
    const requestId = body?.requestId as string | undefined;

    const { duplicate } = checkIdempotency(idemHeader || requestId || null);
    if (duplicate) return jsonError("Submissão duplicada", 409);

    // Payload -> forms
    const forms = normalizeForms(body);
    if (!forms) {
      return jsonError(
        "Payload inválido. Envie {formId, answers} ou {forms: [{id, answers}]}",
        400
      );
    }

    const bytes = await buildPdfReport(forms, {
      title: "Relatório Personalizado Completo",
    });

    return pdfResponse(bytes, idemHeader);
  } catch (e) {
    console.error("[/api/pdf/report] ERROR:", e);
    return jsonError("Erro ao gerar PDF", 500);
  }
}
