// app/api/pdf/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { buildPdfReport, OneForm } from "./pdf-builder";

/** ---------------- hCaptcha ---------------- */
async function verifyHCaptcha(token: string, remoteip?: string) {
  const secret = process.env.HCAPTCHA_SECRET || "";
  if (!secret) return { ok: false, reason: "HCAPTCHA_SECRET ausente" };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }).catch(() => null);

  if (!res || !(res as any).ok) return { ok: false, reason: "Falha de rede na verificação do hCaptcha" };

  const data = await (res as Response).json();
  if (data?.success !== true) {
    return { ok: false, reason: "hCaptcha não validado", codes: data["error-codes"] };
  }
  return { ok: true, data };
}

/** ---------------- Rate limit / Idempotência (in-memory) ---------------- */
type Bucket = { count: number; resetAt: number };
declare global {
  var __rateBuckets__pdfReport: Map<string, Bucket> | undefined;
  var __idemKeys__pdfReport: Map<string, number> | undefined;
}
const buckets = globalThis.__rateBuckets__pdfReport ?? new Map<string, Bucket>();
globalThis.__rateBuckets__pdfReport = buckets;

const idemKeys = globalThis.__idemKeys__pdfReport ?? new Map<string, number>();
globalThis.__idemKeys__pdfReport = idemKeys;

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const IDEM_TTL_MS = 2 * 60_000;

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
function checkIdempotency(key?: string | null) {
  if (!key) return { duplicate: false };
  const now = Date.now();
  for (const [k, ts] of idemKeys) if (now - ts > IDEM_TTL_MS) idemKeys.delete(k);
  if (idemKeys.has(key)) return { duplicate: true };
  idemKeys.set(key, now);
  return { duplicate: false };
}

/** ---------------- Handler ---------------- */
export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(req);
    const rate = checkRate(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em instantes." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }

    // Body + Idempotência
    const idemHeader = req.headers.get("idempotency-key");
    const raw = await req.text();
    const body = raw ? JSON.parse(raw) : {};
    const requestId = body?.requestId as string | undefined;
    const idem = checkIdempotency(idemHeader || requestId || null);
    if (idem.duplicate) return NextResponse.json({ error: "Submissão duplicada" }, { status: 409 });

    // hCaptcha
    const htoken = body?.hcaptchaToken as string | undefined;
    if (!htoken) return NextResponse.json({ error: "Token hCaptcha ausente" }, { status: 400 });
    const hres = await verifyHCaptcha(htoken, ip);
    if (!hres.ok) {
      return NextResponse.json(
        { error: "Falha na verificação do hCaptcha", details: (hres as any).codes || (hres as any).reason },
        { status: 403 }
      );
    }

    // Payload: { forms } OU { formId, answers }
    let forms: OneForm[] = [];
    if (Array.isArray(body?.forms) && body.forms.length) {
      forms = body.forms
        .map((f: any) => ({ id: String(f?.id || ""), answers: (f?.answers || {}) }))
        .filter((f: OneForm) => f.id && f.answers && typeof f.answers === "object");
    } else if (body?.formId && body?.answers && typeof body.answers === "object") {
      forms = [{ id: String(body.formId), answers: body.answers as Record<string, number | string> }];
    } else {
      return NextResponse.json(
        { error: "Payload inválido. Envie {formId, answers} ou {forms: [{id, answers}]}" },
        { status: 400 }
      );
    }

    const bytes = await buildPdfReport(forms, { title: "Relatório consolidado" });

    // Copia para um ArrayBuffer garantido
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);

    const headers: Record<string, string> = {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-consolidado.pdf"`,
      "Content-Length": String(bytes.byteLength),
    };
    if (idemHeader) headers["Idempotency-Key"] = idemHeader;

    return new Response(ab, { status: 200, headers });

  } catch (e) {
    console.error("[/api/pdf/report] ERROR:", e);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
