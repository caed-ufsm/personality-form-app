import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import rawExtroversao from "@/lib/feedbacks/extroversao.json";
import rawNeuroticismo from "@/lib/feedbacks/neuroticismo.json";
import rawAbertura from "@/lib/feedbacks/aberturarexp.json";
import rawAmabilidade from "@/lib/feedbacks/amabilidade.json";
import rawConscienciosidade from "@/lib/feedbacks/conscienciosidade.json";

/** ---------------- Tipos ---------------- */
export type FeedbackLevel = "baixo" | "medio" | "alto";

type PerguntaFeedback = {
  id: string;
  texto: string;
  feedbacks: Record<FeedbackLevel, string>;
};
type FeedbackConsolidado = {
  titulo: string;
  definicao: string;
  caracteristicas: string[];
  vantagens: string[];
  dificuldades: string[];
  estrategias: string[];
  conclusao: string;
};
type Faceta = {
  descricao: string;
  perguntas: PerguntaFeedback[];
  feedbackConsolidado: Record<FeedbackLevel, FeedbackConsolidado>;
};
type FeedbackForm = { facetas: Record<string, Faceta> };
export type OneForm = { id: string; answers: Record<string, number | string> };
type FormKey =
  | "extroversao"
  | "neuroticismo"
  | "aberturarexperiencia"
  | "amabilidade"
  | "conscienciosidade";

/** ---------------- Dados ---------------- */
const FEEDBACKS: Record<FormKey, FeedbackForm> = {
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
const REVERSE_TAG = /^\s*\[R\]\s*/i;

function resolveFormKey(formId: string): FormKey | undefined {
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
type IdResolver = (jsonId: string) => string | null;

const neuroticismoResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase(),
    num = +m[2];
  const offs: Record<string, number> = { N: 0, H: 6, D: 12, AC: 18, I: 24 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `n${off + num}`;
};

const extroversaoResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase(),
    num = +m[2];
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
  return `a${off + num}`; // usa "a" para bater com o storage
};

const amabilidadeResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = +m[2];
  const offs: Record<string, number> = { C: 0, FQ: 6, CP: 12, S: 18 };
  const off = offs[prefix];
  if (off === undefined || !num) return null;
  return `a${off + num}`;
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

const ID_RESOLVERS: Record<FormKey, IdResolver> = {
  neuroticismo: neuroticismoResolver,
  extroversao: extroversaoResolver,
  aberturarexperiencia: aberturaResolver,
  amabilidade: amabilidadeResolver,
  conscienciosidade: conscienciosidadeResolver,
};

/** ---------------- Helpers ---------------- */
function toNumber(v: any): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)))
    return Number(v);
  return undefined;
}

function getAnswerFor(
  formKey: FormKey,
  pergunta: { id: string; texto: string },
  answers: Record<string, any>
): number | undefined {
  if (pergunta.id in answers) {
    const v = toNumber(answers[pergunta.id]);
    if (v !== undefined) return v;
  }
  const mapped = ID_RESOLVERS[formKey](pergunta.id);
  if (mapped && mapped in answers) {
    const v = toNumber(answers[mapped]);
    if (v !== undefined) return v;
  }
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

/** ---------------- Cálculo ---------------- */
function calcularMediaFaceta(
  formKey: FormKey,
  perguntas: PerguntaFeedback[],
  answers: Record<string, any>
): number | null {
  const vals: number[] = [];
  for (let i = 0; i < perguntas.length; i++) {
    const raw = getAnswerFor(formKey, perguntas[i], answers);
    if (typeof raw !== "number") continue;
    let v = raw;
    if (i === perguntas.length - 1) v = 6 - raw;
    vals.push(v);
  }
  if (!vals.length) return null;
  return Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
}

function nivelPorMedia(media: number | null): FeedbackLevel {
  if (media == null) return "medio";
  if (media >= 1 && media <= 2.99) return "baixo";
  if (media >= 3 && media <= 3.99) return "medio";
  return "alto";
}

/** ---------------- Layout helpers ---------------- */
type LayoutCtx = {
  pdfDoc: PDFDocument;
  page: any;
  width: number;
  height: number;
  x: number;
  y: number;
  margin: number;
  fontRegular: any;
  fontBold: any;
};

function newLayout(pdfDoc: PDFDocument, fontRegular: any, fontBold: any): LayoutCtx {
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const margin = 56;
  return { pdfDoc, page, width, height, x: margin, y: height - margin, margin, fontRegular, fontBold };
}
function setPage(ctx: LayoutCtx, page: any) {
  ctx.page = page;
  const { width, height } = page.getSize();
  ctx.width = width;
  ctx.height = height;
  ctx.x = ctx.margin;
  ctx.y = ctx.height - ctx.margin;
}
function newPage(ctx: LayoutCtx) {
  const p = ctx.pdfDoc.addPage();
  setPage(ctx, p);
}
const lineHeight = (s: number) => s * 1.35;
function ensure(ctx: LayoutCtx, needed: number) {
  if (ctx.y - needed < ctx.margin) newPage(ctx);
}
function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = String(text || "").split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function paragraph(ctx: LayoutCtx, text: string, size = 11, color = rgb(0, 0, 0), bold = false) {
  const font = bold ? ctx.fontBold : ctx.fontRegular;
  const maxW = ctx.width - ctx.margin * 2;
  const lh = lineHeight(size);
  const lines = wrapText(text, font, size, maxW);
  ensure(ctx, lh * lines.length);
  for (const ln of lines) {
    ctx.page.drawText(ln, { x: ctx.x, y: ctx.y - lh + 3, size, font, color });
    ctx.y -= lh;
  }
  ctx.y -= size * 0.25;
}
function heading(ctx: LayoutCtx, text: string, size = 20, color = rgb(0.08, 0.28, 0.58)) {
  const lh = lineHeight(size);
  ensure(ctx, lh + 8);
  ctx.page.drawText(text, { x: ctx.x, y: ctx.y - lh + 3, size, font: ctx.fontBold, color });
  ctx.y -= lh;
  ctx.page.drawLine({
    start: { x: ctx.x, y: ctx.y - 6 },
    end: { x: ctx.width - ctx.margin, y: ctx.y - 6 },
    thickness: 2,
    color,
  });
  ctx.y -= 14;
}
function subheading(ctx: LayoutCtx, text: string, size = 14, color = rgb(0.08, 0.08, 0.08)) {
  const lh = lineHeight(size);
  ensure(ctx, lh);
  ctx.page.drawText(text, { x: ctx.x, y: ctx.y - lh + 3, size, font: ctx.fontBold, color });
  ctx.y -= lh;
}
function bulletList(ctx: LayoutCtx, items: string[], size = 11, bulletColor = rgb(0.08, 0.28, 0.58)) {
  const maxW = ctx.width - ctx.margin * 2 - 16;
  const lh = lineHeight(size);
  for (const item of items) {
    const lines = wrapText(item, ctx.fontRegular, size, maxW);
    ensure(ctx, lh * lines.length);
    ctx.page.drawCircle({ x: ctx.x + 2, y: ctx.y - lh / 2 + 3, size: 1.5, color: bulletColor });
    ctx.page.drawText(lines[0], { x: ctx.x + 16, y: ctx.y - lh + 3, size, font: ctx.fontRegular });
    ctx.y -= lh;
    for (const extra of lines.slice(1)) {
      ctx.page.drawText(extra, { x: ctx.x + 16, y: ctx.y - lh + 3, size, font: ctx.fontRegular });
      ctx.y -= lh;
    }
  }
  ctx.y -= size * 0.25;
}

/** ---------------- Builder ---------------- */
export async function buildPdfReport(forms: OneForm[], opts?: { title?: string }): Promise<Uint8Array> {
  const PRIMARY = rgb(0.08, 0.28, 0.58);
  const ACCENT = rgb(0.15, 0.62, 0.45);
  const TEXT_MUTED = rgb(0.35, 0.35, 0.35);

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const ctx = newLayout(pdfDoc, fontRegular, fontBold);

  ctx.page.drawRectangle({ x: 0, y: ctx.height - 40, width: ctx.width, height: 40, color: PRIMARY });
  ctx.page.drawText("Relatório do Formulário", { x: ctx.margin, y: ctx.height - 30, size: 12, color: rgb(1,1,1), font: fontBold });

  ctx.y = ctx.height - ctx.margin - 40;
  heading(ctx, opts?.title ?? "Relatório consolidado", 22, PRIMARY);
  paragraph(ctx, "Este relatório apresenta o nível consolidado por faceta e o feedback geral do participante.", 12, TEXT_MUTED);

  const openContentPage = () => { const p = pdfDoc.addPage(); setPage(ctx, p); };
  openContentPage();

  for (let i = 0; i < forms.length; i++) {
    const { id: formIdRaw, answers } = forms[i];
    const formKey = resolveFormKey(formIdRaw);
    const label = formKey ? formKey.charAt(0).toUpperCase() + formKey.slice(1) : String(formIdRaw);

    if (i > 0) openContentPage();

    heading(ctx, `Formulário: ${label}`, 22, PRIMARY);

    if (!formKey) {
      paragraph(ctx, "Feedback não encontrado para este formulário.", 12, TEXT_MUTED);
      continue;
    }

    const fb = FEEDBACKS[formKey];

    // --- FACETAS ---
    for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
      const titleSize = 16,
        lhTitle = lineHeight(titleSize),
        titleTopY = ctx.y - lhTitle + 3;

      ctx.page.drawRectangle({
        x: ctx.margin - 8,
        y: titleTopY - 2,
        width: 6,
        height: lhTitle - 2,
        color: ACCENT,
      });

      const avg = calcularMediaFaceta(formKey, facetaData.perguntas, answers);
      const nivel = nivelPorMedia(avg);
      const map: Record<FeedbackLevel, string> = {
        baixo: "Baixo",
        medio: "Médio",
        alto: "Alto",
      };

      subheading(ctx, `Faceta: ${facetaNome}`, titleSize, PRIMARY);
      paragraph(ctx, facetaData.descricao, 12, TEXT_MUTED);

      paragraph(
        ctx,
        `Nível obtido: ${map[nivel]}${avg != null ? ` (média: ${avg.toFixed(2)})` : ""}`,
        12,
        rgb(0.12, 0.12, 0.12),
        true
      );

      const consolidado = facetaData.feedbackConsolidado[nivel];
      if (consolidado) {
        subheading(ctx, consolidado.titulo, 13, rgb(0, 0, 0));
        paragraph(ctx, consolidado.definicao, 11);
        if (consolidado.caracteristicas?.length) {
          subheading(ctx, "Características", 12, PRIMARY);
          bulletList(ctx, consolidado.caracteristicas, 11);
        }
        if (consolidado.vantagens?.length) {
          subheading(ctx, "Vantagens", 12, PRIMARY);
          bulletList(ctx, consolidado.vantagens, 11);
        }
        if (consolidado.dificuldades?.length) {
          subheading(ctx, "Dificuldades", 12, PRIMARY);
          bulletList(ctx, consolidado.dificuldades, 11);
        }
        if (consolidado.estrategias?.length) {
          subheading(ctx, "Estratégias de Desenvolvimento", 12, PRIMARY);
          bulletList(ctx, consolidado.estrategias, 11);
        }
        if (consolidado.conclusao) {
          paragraph(ctx, consolidado.conclusao, 11);
        }
      }

      ctx.y -= 8;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
