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
type FeedbackForm = {
  titulo?: string;
  descricao?: string;
  facetas: Record<string, Faceta>;
};

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
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
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
  const lower = new Map<string, string>(Object.keys(answers).map((k) => [k.toLowerCase(), k]));
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

/** ---------------- Layout helpers (NOVO) ---------------- */
const makeTheme = () => {
  const PRIMARY = rgb(0.08, 0.28, 0.58);
  const ACCENT = PRIMARY;
  const TEXT = rgb(0.09, 0.09, 0.10);
  const MUTED = rgb(0.40, 0.40, 0.45);
  const DIVIDER = rgb(0.87, 0.88, 0.90);
  const BG = rgb(0.98, 0.98, 0.99);
  const CARD_BG = rgb(1, 1, 1);
  const DANGER = rgb(0.72, 0.12, 0.12);

  const LEVEL = {
    baixo: { fg: rgb(0.08, 0.28, 0.58), bg: rgb(0.92, 0.96, 1.0) },
    medio: { fg: rgb(0.08, 0.28, 0.58), bg: rgb(0.92, 0.96, 1.0) },
    alto: { fg: rgb(0.08, 0.28, 0.58), bg: rgb(0.92, 0.96, 1.0) },
  } as const;

  return { PRIMARY, ACCENT, TEXT, MUTED, DIVIDER, BG, CARD_BG, DANGER, LEVEL };
};

type Theme = ReturnType<typeof makeTheme>;

type LayoutCtx = {
  pdfDoc: PDFDocument;
  page: any;
  pageIndex: number;
  width: number;
  height: number;
  margin: number;
  headerH: number;
  footerH: number;
  x: number;
  y: number;
  fontRegular: any;
  fontBold: any;
  theme: Theme;
  headerTitle: string;
  coverIndex: number; // página da capa
};

const lineHeight = (s: number) => s * 1.35;

function setPage(ctx: LayoutCtx, page: any, pageIndex: number) {
  ctx.page = page;
  ctx.pageIndex = pageIndex;
  const { width, height } = page.getSize();
  ctx.width = width;
  ctx.height = height;
  ctx.x = ctx.margin;
  ctx.y = ctx.height - ctx.margin - ctx.headerH;
}

function newLayout(pdfDoc: PDFDocument, fontRegular: any, fontBold: any, headerTitle: string): LayoutCtx {
  const theme = makeTheme();
  const margin = 56;
  const headerH = 44;
  const footerH = 28;

  const page = pdfDoc.addPage();
  const pageIndex = pdfDoc.getPages().length - 1;

  const ctx: LayoutCtx = {
    pdfDoc,
    page,
    pageIndex,
    width: page.getSize().width,
    height: page.getSize().height,
    margin,
    headerH,
    footerH,
    x: margin,
    y: page.getSize().height - margin - headerH,
    fontRegular,
    fontBold,
    theme,
    headerTitle,
    coverIndex: pageIndex,
  };

  return ctx;
}

function safeBottom(ctx: LayoutCtx) {
  return ctx.margin + ctx.footerH;
}

function ensure(ctx: LayoutCtx, needed: number) {
  if (ctx.y - needed < safeBottom(ctx)) openContentPage(ctx);
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

function drawHeader(ctx: LayoutCtx) {
  const { PRIMARY, BG } = ctx.theme;

  // fundo
  ctx.page.drawRectangle({ x: 0, y: 0, width: ctx.width, height: ctx.height, color: BG });

  // topo
  ctx.page.drawRectangle({
    x: 0,
    y: ctx.height - ctx.headerH,
    width: ctx.width,
    height: ctx.headerH,
    color: PRIMARY,
  });

  ctx.page.drawText(ctx.headerTitle, {
    x: ctx.margin,
    y: ctx.height - ctx.headerH + 14,
    size: 12,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });
}

function drawFooter(ctx: LayoutCtx, pageNumber: number, totalPages: number) {
  const y = ctx.margin - 14;
  ctx.page.drawLine({
    start: { x: ctx.margin, y: y + 10 },
    end: { x: ctx.width - ctx.margin, y: y + 10 },
    thickness: 1,
    color: ctx.theme.DIVIDER,
  });

  const label = `${pageNumber} / ${totalPages}`;
  ctx.page.drawText(label, {
    x: ctx.width - ctx.margin - ctx.fontRegular.widthOfTextAtSize(label, 10),
    y,
    size: 10,
    font: ctx.fontRegular,
    color: ctx.theme.MUTED,
  });
}

function openContentPage(ctx: LayoutCtx) {
  const p = ctx.pdfDoc.addPage();
  const idx = ctx.pdfDoc.getPages().length - 1;
  setPage(ctx, p, idx);
  drawHeader(ctx);
}

function divider(ctx: LayoutCtx, gapTop = 10, gapBottom = 14) {
  ensure(ctx, gapTop + gapBottom + 2);
  ctx.y -= gapTop;
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 1,
    color: ctx.theme.DIVIDER,
  });
  ctx.y -= gapBottom;
}

function paragraph(ctx: LayoutCtx, text: string, size = 11, color = makeTheme().TEXT, bold = false) {
  const font = bold ? ctx.fontBold : ctx.fontRegular;
  const maxW = ctx.width - ctx.margin * 2;
  const lh = lineHeight(size);
  const lines = wrapText(text, font, size, maxW);
  ensure(ctx, lh * lines.length + 6);
  for (const ln of lines) {
    ctx.page.drawText(ln, { x: ctx.margin, y: ctx.y - lh + 3, size, font, color });
    ctx.y -= lh;
  }
  ctx.y -= 6;
}

function heading(ctx: LayoutCtx, text: string, size = 22, color?: any) {
  const lh = lineHeight(size);
  ensure(ctx, lh + 14);
  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y - lh + 3,
    size,
    font: ctx.fontBold,
    color: color ?? ctx.theme.TEXT,
  });
  ctx.y -= lh;
  ctx.y -= 6;
}

function subheading(ctx: LayoutCtx, text: string, size = 14, color?: any) {
  const lh = lineHeight(size);
  ensure(ctx, lh + 6);
  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y - lh + 3,
    size,
    font: ctx.fontBold,
    color: color ?? ctx.theme.TEXT,
  });
  ctx.y -= lh;
  ctx.y -= 4;
}

function bulletList(ctx: LayoutCtx, items: string[], size = 11) {
  const maxW = ctx.width - ctx.margin * 2 - 18;
  const lh = lineHeight(size);
  for (const item of items) {
    const lines = wrapText(item, ctx.fontRegular, size, maxW);
    ensure(ctx, lh * lines.length + 6);

    ctx.page.drawCircle({
      x: ctx.margin + 4,
      y: ctx.y - lh / 2 + 3,
      size: 1.6,
      color: ctx.theme.ACCENT,
    });

    ctx.page.drawText(lines[0], {
      x: ctx.margin + 18,
      y: ctx.y - lh + 3,
      size,
      font: ctx.fontRegular,
      color: ctx.theme.TEXT,
    });
    ctx.y -= lh;

    for (const extra of lines.slice(1)) {
      ctx.page.drawText(extra, {
        x: ctx.margin + 18,
        y: ctx.y - lh + 3,
        size,
        font: ctx.fontRegular,
        color: ctx.theme.TEXT,
      });
      ctx.y -= lh;
    }

    ctx.y -= 2;
  }
  ctx.y -= 6;
}

function callout(ctx: LayoutCtx, title: string, text: string, variant: "info" | "danger" = "info") {
  const pad = 12;
  const titleSize = 12;
  const textSize = 11;

  const fg = variant === "danger" ? ctx.theme.DANGER : ctx.theme.PRIMARY;
  const bg = variant === "danger" ? rgb(1.0, 0.94, 0.94) : rgb(0.93, 0.96, 1.0);

  const contentW = ctx.width - ctx.margin * 2;

  const titleLines = wrapText(title, ctx.fontBold, titleSize, contentW - pad * 2);
  const textLines = wrapText(text, ctx.fontRegular, textSize, contentW - pad * 2);

  const h =
    pad +
    titleLines.length * lineHeight(titleSize) +
    4 +
    textLines.length * lineHeight(textSize) +
    pad;

  ensure(ctx, h + 10);

  const top = ctx.y;
  const y = top - h;

  ctx.page.drawRectangle({
    x: ctx.margin,
    y,
    width: contentW,
    height: h,
    color: bg,
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  });

  ctx.page.drawRectangle({
    x: ctx.margin,
    y,
    width: 5,
    height: h,
    color: fg,
  });

  let yy = top - pad;

  const lhT = lineHeight(titleSize);
  for (const ln of titleLines) {
    ctx.page.drawText(ln, {
      x: ctx.margin + pad + 6,
      y: yy - lhT + 3,
      size: titleSize,
      font: ctx.fontBold,
      color: ctx.theme.TEXT,
    });
    yy -= lhT;
  }

  yy -= 2;

  const lhP = lineHeight(textSize);
  for (const ln of textLines) {
    ctx.page.drawText(ln, {
      x: ctx.margin + pad + 6,
      y: yy - lhP + 3,
      size: textSize,
      font: ctx.fontRegular,
      color: ctx.theme.TEXT,
    });
    yy -= lhP;
  }

  ctx.y = y - 12;
}

function pill(ctx: LayoutCtx, x: number, y: number, label: string, fg: any, bg: any) {
  const size = 10;
  const padX = 8;
  const padY = 5;
  const textW = ctx.fontBold.widthOfTextAtSize(label, size);
  const w = textW + padX * 2;
  const h = size + padY * 2;

  ctx.page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: bg,
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  });

  ctx.page.drawText(label, {
    x: x + padX,
    y: y + padY,
    size,
    font: ctx.fontBold,
    color: fg,
  });

  return { w, h };
}

/** ✅ NOVO: estimar altura do card pra poder “garantir” e registrar TOC com página certa */
function estimateCardHeight(ctx: LayoutCtx, title: string, desc: string) {
  const pad = 14;
  const w = ctx.width - ctx.margin * 2;
  const innerW = w - pad * 2;
  const titleSize = 14;
  const descSize = 11;

  const titleH = lineHeight(titleSize);
  const descLines = wrapText(desc, ctx.fontRegular, descSize, innerW).slice(0, 6);
  const descH = descLines.length * lineHeight(descSize);
  const h = Math.max(120, pad + titleH + 12 + descH + pad);

  return h;
}

/** ✅ ALTERADO: card agora aceita preEnsured */
function card(
  ctx: LayoutCtx,
  title: string,
  badge: { text: string; fg: any; bg: any },
  desc: string,
  preEnsured = false
) {
  const pad = 14;
  const w = ctx.width - ctx.margin * 2;

  const innerW = w - pad * 2;
  const titleSize = 14;
  const descSize = 11;

  const titleH = lineHeight(titleSize);
  const descLines = wrapText(desc, ctx.fontRegular, descSize, innerW).slice(0, 6);
  const descH = descLines.length * lineHeight(descSize);
  const h = Math.max(120, pad + titleH + 12 + descH + pad);

  if (!preEnsured) ensure(ctx, h + 16);

  const top = ctx.y;
  const y = top - h;

  ctx.page.drawRectangle({
    x: ctx.margin,
    y,
    width: w,
    height: h,
    color: ctx.theme.CARD_BG,
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  });

  ctx.page.drawRectangle({
    x: ctx.margin,
    y: y + h - 4,
    width: w,
    height: 4,
    color: ctx.theme.ACCENT,
  });

  ctx.page.drawText(title, {
    x: ctx.margin + pad,
    y: top - pad - titleH + 3,
    size: titleSize,
    font: ctx.fontBold,
    color: ctx.theme.TEXT,
  });

  const badgeY = top - pad - 18;
  const badgeX = ctx.margin + w - pad - 170;
  pill(ctx, badgeX, badgeY, badge.text, badge.fg, badge.bg);

  let yy = top - pad - 30;
  const lh = lineHeight(descSize);
  for (const ln of descLines) {
    ctx.page.drawText(ln, {
      x: ctx.margin + pad,
      y: yy - lh + 3,
      size: descSize,
      font: ctx.fontRegular,
      color: ctx.theme.MUTED,
    });
    yy -= lh;
  }

  ctx.y = y - 12;
}

/** ---------------- Builder ---------------- */
type TocFactorEntry = {
  label: string;       // nome do fator
  page: number;        // página onde começa o fator
  facetas: string[];   // nomes das características (facetas) daquele fator
};

export async function buildPdfReport(
  forms: OneForm[],
  opts?: { title?: string }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const HEADER_TITLE = opts?.title?.trim() || "Relatório Completo Personalizado";
  const ctx = newLayout(pdfDoc, fontRegular, fontBold, HEADER_TITLE);

  /** ---------------- CAPA ---------------- */
  {
    const page = ctx.page;
    const { PRIMARY, BG } = ctx.theme;

    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width, height, color: BG });

    page.drawRectangle({ x: 0, y: height - 170, width, height: 170, color: PRIMARY });

    page.drawText("Programa de Autoconhecimento Docente", {
      x: ctx.margin,
      y: height - 96,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText("Relatório personalizado", {
      x: ctx.margin,
      y: height - 126,
      size: 18,
      font: fontRegular,
      color: rgb(1, 1, 1),
    });

    ctx.y = height - ctx.margin - 190;

    callout(
      ctx,
      "Importante",
      "Este relatório é um recurso de autodesenvolvimento e reflexão. Ele não substitui psicoterapia ou avaliação clínica.",
      "danger"
    );

    paragraph(
      ctx,
      "O Programa de Autoconhecimento é um processo estruturado que busca apoiar docentes da UFSM no desenvolvimento pessoal e profissional.",
      12,
      ctx.theme.TEXT
    );

    subheading(ctx, "Objetivos do Programa", 15, ctx.theme.PRIMARY);
    bulletList(
      ctx,
      [
        "Explorar características pessoais, valores e motivações.",
        "Promover equilíbrio entre vida profissional e pessoal.",
        "Fomentar a saúde mental e o bem-estar docente.",
        "Desenvolver habilidades de comunicação e relações interpessoais.",
        "Aprimorar o gerenciamento do estresse acadêmico.",
        "Fortalecer o crescimento e preparo para desafios futuros.",
      ],
      12
    );

    callout(
      ctx,
      "Personalidade (Big Five)",
      "Os formulários utilizam os Cinco Grandes Fatores da Personalidade — Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo — para compreender como diferentes traços influenciam atitudes, comportamentos e potencial de crescimento pessoal.",
      "info"
    );
  }

  /** ---------------- SUMÁRIO (placeholder e preenchido no final) ---------------- */
  const tocPage = pdfDoc.addPage();
  setPage(ctx, tocPage, pdfDoc.getPages().length - 1);
  drawHeader(ctx);

  heading(ctx, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx);

  const tocStartY = ctx.y;

  // ✅ AGORA guardamos fator + facetas
  const tocFactors: TocFactorEntry[] = [];

  /** ---------------- CONTEÚDO ---------------- */
  openContentPage(ctx);

  for (let i = 0; i < forms.length; i++) {
    const { id: formIdRaw, answers } = forms[i];
    const formKey = resolveFormKey(formIdRaw);

    if (i > 0) openContentPage(ctx);

    if (!formKey) {
      heading(ctx, `Fator: ${String(formIdRaw)}`, 22, ctx.theme.PRIMARY);
      paragraph(ctx, "Feedback não encontrado para este formulário.", 12, ctx.theme.MUTED);
      continue;
    }

    const fb = FEEDBACKS[formKey];
    const label = fb.titulo?.trim() || formKey.charAt(0).toUpperCase() + formKey.slice(1);

    // ✅ registra fator no sumário (página 1-based)
    tocFactors.push({ label: `Fator: ${label}`, page: ctx.pageIndex + 1, facetas: [] });

    heading(ctx, `Fator: ${label}`, 24, ctx.theme.PRIMARY);
    if (fb.descricao) paragraph(ctx, fb.descricao, 11, ctx.theme.MUTED);
    divider(ctx);

    // --- FACETAS ---
    for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
      const facetaTitulo = String((facetaData as any).titulo ?? facetaNome);
      const desc = String((facetaData as any).descricao ?? "");

      // ✅ adiciona no sumário "as características do fator"
      tocFactors[tocFactors.length - 1].facetas.push(facetaTitulo);

      const avg = calcularMediaFaceta(formKey, (facetaData as any).perguntas, answers);
      const nivel = nivelPorMedia(avg);

      const map: Record<FeedbackLevel, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };
      const lvl = ctx.theme.LEVEL[nivel];
      const badgeText = `Nível: ${map[nivel]}${avg != null ? ` • Média: ${avg.toFixed(2)}` : ""}`;

      // ✅ garante espaço antes, para evitar que o ensure interno mude a página
      const hCard = estimateCardHeight(ctx, `Característica: ${facetaTitulo}`, desc);
      ensure(ctx, hCard + 16);

      card(
        ctx,
        `Característica: ${facetaTitulo}`,
        { text: badgeText, fg: lvl.fg, bg: lvl.bg },
        desc,
        true
      );

      const consolidado = (facetaData as any).feedbackConsolidado?.[nivel];
      if (consolidado) {
        subheading(ctx, String(consolidado.titulo), 12, ctx.theme.TEXT);
        paragraph(ctx, String(consolidado.definicao ?? ""), 11, ctx.theme.TEXT);

        const section = (t: string) => {
          ensure(ctx, 24);
          ctx.page.drawText(t, {
            x: ctx.margin,
            y: ctx.y - lineHeight(12) + 3,
            size: 12,
            font: ctx.fontBold,
            color: ctx.theme.PRIMARY,
          });
          ctx.y -= lineHeight(12);
          ctx.y -= 2;
        };

        if (consolidado.caracteristicas?.length) {
          section("Características");
          bulletList(ctx, consolidado.caracteristicas, 11);
        }
        if (consolidado.vantagens?.length) {
          section("Vantagens");
          bulletList(ctx, consolidado.vantagens, 11);
        }
        if (consolidado.dificuldades?.length) {
          section("Dificuldades");
          bulletList(ctx, consolidado.dificuldades, 11);
        }
        if (consolidado.estrategias?.length) {
          section("Estratégias de Desenvolvimento");
          bulletList(ctx, consolidado.estrategias, 11);
        }
        if (consolidado.conclusao) paragraph(ctx, String(consolidado.conclusao), 11, ctx.theme.TEXT);

        divider(ctx);
      } else {
        ctx.y -= 6;
      }
    }
  }

  /** ---------------- ENCERRAMENTO ---------------- */
  openContentPage(ctx);
  heading(ctx, "Mensagem final", 22, ctx.theme.PRIMARY);

  callout(
    ctx,
    "Encerramento",
    "Esperamos que este relatório tenha proporcionado insights valiosos sobre seu perfil e contribuído para o seu desenvolvimento pessoal e profissional.",
    "info"
  );

  paragraph(
    ctx,
    "Lembre-se: autoconhecimento é uma jornada contínua. Use estas informações como ponto de partida para reflexões, melhorias e fortalecimento de suas habilidades pessoais e profissionais.",
    12,
    ctx.theme.TEXT
  );

  paragraph(
    ctx,
    "Agradecemos por participar do Programa de Autoconhecimento Docente.",
    12,
    ctx.theme.TEXT,
    true
  );

  /** ---------------- PREENCHER SUMÁRIO (com características) ---------------- */
  setPage(ctx, tocPage, 1);
  drawHeader(ctx);
  heading(ctx, "Sumário", 22, ctx.theme.TEXT);
  paragraph(ctx, "Visão geral das seções do relatório e suas características.", 11, ctx.theme.MUTED);
  divider(ctx);

  ctx.y = tocStartY;

  const rowH = 16;

  // ✅ estilos das facetas no sumário
  const facetaSize = 9;
  const facetaIndent = 18;
  const facetaMaxW = ctx.width - ctx.margin * 2 - facetaIndent;

  for (const it of tocFactors) {
    ensure(ctx, rowH + 6);

    const left = it.label;
    const right = String(it.page);

    ctx.page.drawText(left, {
      x: ctx.margin,
      y: ctx.y - lineHeight(11) + 3,
      size: 11,
      font: ctx.fontRegular,
      color: ctx.theme.TEXT,
    });

    const dots = "........................................................................";
    ctx.page.drawText(dots, {
      x: ctx.margin + 250,
      y: ctx.y - lineHeight(11) + 3,
      size: 10,
      font: ctx.fontRegular,
      color: ctx.theme.DIVIDER,
    });

    ctx.page.drawText(right, {
      x: ctx.width - ctx.margin - ctx.fontBold.widthOfTextAtSize(right, 11),
      y: ctx.y - lineHeight(11) + 3,
      size: 11,
      font: ctx.fontBold,
      color: ctx.theme.MUTED,
    });

    ctx.y -= rowH;

    // ✅ agora: lista das características (facetas) do fator, indentada
    if (it.facetas?.length) {
      const facetaLine = it.facetas.join(" • ");
      const lines = wrapText(facetaLine, ctx.fontRegular, facetaSize, facetaMaxW);

      for (const ln of lines) {
        ensure(ctx, lineHeight(facetaSize) + 2);
        ctx.page.drawText(ln, {
          x: ctx.margin + facetaIndent,
          y: ctx.y - lineHeight(facetaSize) + 3,
          size: facetaSize,
          font: ctx.fontRegular,
          color: ctx.theme.MUTED,
        });
        ctx.y -= lineHeight(facetaSize);
      }

      ctx.y -= 6; // respiro entre fatores
    }
  }

  /** ---------------- PAGINAÇÃO (rodapé em todas, exceto capa) ---------------- */
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    if (i === ctx.coverIndex) continue;

    const p = pages[i];
    const tmp = { ...ctx };
    setPage(tmp, p, i);
    drawFooter(tmp, i + 1, total);
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
