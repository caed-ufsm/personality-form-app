// app/api/pdf/report/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import rawExtroversao from "@/lib/feedbacks/extroversao.json";
import rawNeuroticismo from "@/lib/feedbacks/neuroticismo.json";

type FeedbackLevel = "baixo" | "medio" | "alto";
type PerguntaFeedback = { id: string; texto: string; feedbacks: Record<FeedbackLevel, string> };
type FeedbackConsolidado = {
  titulo: string; definicao: string; caracteristicas: string[];
  vantagens: string[]; dificuldades: string[]; estrategias: string[]; conclusao: string;
};
type Faceta = { descricao: string; perguntas: PerguntaFeedback[]; feedbackConsolidado: Record<FeedbackLevel, FeedbackConsolidado> };
type FeedbackForm = { facetas: Record<string, Faceta> };

// JSONs normalizados
const extroversao: FeedbackForm = (rawExtroversao as any).Extroversao;
const neuroticismo: FeedbackForm = (rawNeuroticismo as any).Neuroticismo;
const FEEDBACKS: Record<string, FeedbackForm> = { extroversao, neuroticismo };

// por-pergunta opcional
const includeQuestions = true;

/* =========================================================
   RESOLVERS POR FORMULÁRIO (Opção A)
   ========================================================= */
type IdResolver = (jsonId: string) => string | null;

// N1..N6 (n1..n6), H1..H6 (n7..n12), D1..D6 (n13..n18), AC1..AC6 (n19..n24), I1..I6 (n25..n30)
const neuroticismoResolver: IdResolver = (jsonId) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(jsonId);
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const num = parseInt(m[2], 10);
  if (!num) return null;
  const offsets: Record<string, number> = { N: 0, H: 6, D: 12, AC: 18, I: 24 };
  const off = offsets[prefix];
  if (off === undefined) return null;
  return `n${off + num}`;
};

const ID_RESOLVERS: Record<string, IdResolver> = {
  neuroticismo: neuroticismoResolver,
  // extroversao: (jsonId) => jsonId.toLowerCase(), // exemplo se precisar
};

function mapJsonIdToFormId(formId: string, jsonId: string): string | null {
  const fn = ID_RESOLVERS[formId];
  return fn ? fn(jsonId) : null;
}

function getAnswerFor(
  formId: string,
  pergunta: { id: string; texto: string },
  answers: Record<string, number>
): number | undefined {
  // 1) direto
  if (pergunta.id in answers) return answers[pergunta.id];

  // 2) resolver por form
  const mapped = mapJsonIdToFormId(formId, pergunta.id);
  if (mapped && mapped in answers) return answers[mapped];

  // 3) case-insensitive simples
  const low = pergunta.id.toLowerCase();
  const k = Object.keys(answers).find((a) => a.toLowerCase() === low);
  if (k) return answers[k];

  return undefined;
}

/* ========= reverse handling (aplica SÓ na média da faceta) ========= */
const REVERSE_TAG = /^\s*\[R\]\s*/i;
const isReverse = (p: { texto: string }) => REVERSE_TAG.test(p.texto);
const stripReverseTag = (s: string) => String(s || "").replace(REVERSE_TAG, "");
const reverseLikert1to5 = (v: number) => 6 - v;

function diagFaceta(
  formId: string,
  facetaNome: string,
  perguntas: { id: string; texto: string }[],
  answers: Record<string, number>
) {
  const missing: string[] = [];
  const matched: string[] = [];
  for (const p of perguntas) {
    const v = getAnswerFor(formId, p, answers);
    (typeof v === "number" ? matched : missing).push(p.id);
  }
  const cov = perguntas.length ? Math.round((matched.length / perguntas.length) * 100) : 0;
  console.log(`[diag] ${facetaNome}: matched=${matched.length}/${perguntas.length} (${cov}%) missing=`, missing);
}

function calcularNivelFaceta(
  formId: string,
  perguntas: PerguntaFeedback[],
  answers: Record<string, number>
): FeedbackLevel {
  const valores: number[] = [];
  for (const p of perguntas) {
    const raw = getAnswerFor(formId, p, answers);
    if (typeof raw !== "number") continue;

    // aplica reverse SOMENTE na média da faceta
    const val = isReverse(p) ? reverseLikert1to5(raw) : raw;
    valores.push(val);
  }
  if (valores.length === 0) return "medio";
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  if (media <= 2) return "baixo";
  if (media >= 4) return "alto";
  return "medio";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const { formId, answers } = body ?? {};
    if (!formId || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const fb = FEEDBACKS[formId];

    // ====== cores ======
    const PRIMARY = rgb(0.08, 0.28, 0.58); // azul
    const ACCENT  = rgb(0.15, 0.62, 0.45); // verde
    const MUTED   = rgb(0.35, 0.35, 0.35);
    const LIGHT   = rgb(0.85, 0.85, 0.85);

    // ====== PDF base ======
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // helpers layout
    const margin = 56;
    const lineHeight = (size: number) => size * 1.35;
    let page = pdfDoc.addPage(); // CAPA (página 1)
    let { width, height } = page.getSize();
    let x = margin;
    let y = height - margin;

    const setPage = (p: any) => {
      page = p;
      ({ width, height } = page.getSize());
      x = margin;
      y = height - margin;
    };
    const newPage = () => setPage(pdfDoc.addPage());
    const ensure = (needed: number) => { if (y - needed < margin) newPage(); };
    const wrapText = (text: string, font: any, size: number, maxWidth: number) => {
      const words = (String(text || "")).split(/\s+/);
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) > maxWidth && line) { lines.push(line); line = w; }
        else line = test;
      }
      if (line) lines.push(line);
      return lines;
    };
    const drawParagraph = (text: string, size = 11, color = rgb(0,0,0), bold = false) => {
      const font = bold ? fontBold : fontRegular;
      const maxWidth = width - margin*2;
      const lh = lineHeight(size);
      const lines = wrapText(text, font, size, maxWidth);
      ensure(lh * lines.length);
      for (const ln of lines) {
        page.drawText(ln, { x, y: y - lh + 3, size, font, color });
        y -= lh;
      }
      y -= size * 0.25;
    };
    const heading = (text: string, size = 20, color = PRIMARY) => {
      const lh = lineHeight(size);
      ensure(lh + 8);
      page.drawText(text, { x, y: y - lh + 3, size, font: fontBold, color });
      y -= lh;
      page.drawLine({ start: { x, y: y - 6 }, end: { x: width - margin, y: y - 6 }, thickness: 2, color });
      y -= 14;
    };
    const subheading = (text: string, size = 14, color = rgb(0.08,0.08,0.08)) => {
      const lh = lineHeight(size);
      ensure(lh);
      page.drawText(text, { x, y: y - lh + 3, size, font: fontBold, color });
      y -= lh;
    };
    const bulletList = (items: string[], size = 11) => {
      const maxWidth = width - margin*2 - 16;
      const lh = lineHeight(size);
      for (const item of items) {
        const lines = wrapText(item, fontRegular, size, maxWidth);
        ensure(lh * lines.length);
        page.drawCircle({ x: x + 2, y: y - lh/2 + 3, size: 1.5, color: PRIMARY });
        page.drawText(lines[0], { x: x + 16, y: y - lh + 3, size, font: fontRegular });
        y -= lh;
        for (const extra of lines.slice(1)) {
          page.drawText(extra, { x: x + 16, y: y - lh + 3, size, font: fontRegular });
          y -= lh;
        }
      }
      y -= size * 0.25;
    };

    // ====== CAPA ======
    // faixa superior colorida
    page.drawRectangle({ x: 0, y: height - 40, width, height: 40, color: PRIMARY });
    page.drawText("Relatório do Formulário", {
      x: margin, y: height - 30, size: 12, color: rgb(1,1,1), font: fontBold
    });

    y = height - margin - 40;
    heading(`Relatório do Formulário: ${formId}`, 22, PRIMARY);
    drawParagraph(
      "Este relatório apresenta o nível consolidado por faceta e o detalhamento das respostas por afirmação. " +
      "Escala: 1 (Discordo totalmente) — 5 (Concordo totalmente).",
      12,
      rgb(0.35,0.35,0.35)
    );

    // ====== PÁGINA 2: SUMÁRIO + RESUMO GERAL ======
    const tocPage = pdfDoc.addPage();
    setPage(tocPage);
    heading("Sumário", 18, rgb(0.15, 0.62, 0.45));

    const tocItems: Array<{ title: string; page: number }> = [];

    const afterTocYStart = () => {
      if (y > height - margin - 180) y = height - margin - 180;
    };

    // ====== CONTEÚDO: CADA FACETA EM UMA NOVA PÁGINA ======
    newPage();

    if (!fb) {
      heading("Feedback não encontrado para este formulário.", 16, PRIMARY);
    } else {
      // resumo geral
      const resumoLinhas: string[] = [];
      for (const [nome, faceta] of Object.entries(fb.facetas)) {
        const nivel = calcularNivelFaceta(formId, faceta.perguntas, answers);
        const map: Record<FeedbackLevel, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };
        resumoLinhas.push(`${nome}: ${map[nivel]}`);
      }

      // facetas
      let firstFaceta = true;
      for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
        if (!firstFaceta) newPage();
        firstFaceta = false;

        diagFaceta(formId, facetaNome, facetaData.perguntas, answers);

        tocItems.push({ title: facetaNome, page: pdfDoc.getPageCount() });

        page.drawRectangle({ x: 0, y: y + 8, width: 6, height: 32, color: rgb(0.15, 0.62, 0.45) });
        subheading(`Faceta: ${facetaNome}`, 16, PRIMARY);
        drawParagraph(facetaData.descricao, 12, rgb(0.35,0.35,0.35));

        const nivel = calcularNivelFaceta(formId, facetaData.perguntas, answers);
        const consolidado = facetaData.feedbackConsolidado[nivel];
        if (consolidado) {
          subheading(consolidado.titulo, 13, rgb(0,0,0));
          drawParagraph(consolidado.definicao, 11);
        }

        if (includeQuestions) {
          subheading("Respostas desta faceta", 13, rgb(0,0,0));
          for (const pergunta of facetaData.perguntas) {
            const resposta = getAnswerFor(formId, pergunta, answers);
            if (typeof resposta !== "number") continue;

            const faixa: FeedbackLevel = resposta <= 2 ? "baixo" : resposta >= 4 ? "alto" : "medio";
            const fbPerg = pergunta.feedbacks[faixa];

            // Mostra o texto sem o marcador [R]
            drawParagraph(stripReverseTag(pergunta.texto), 11, rgb(0,0,0), true);
            drawParagraph(`Resposta: ${String(resposta)} (faixa: ${faixa})`, 11, rgb(0.12,0.12,0.12));
            drawParagraph(`Feedback: ${fbPerg}`, 11);
            y -= 6;
          }
        }
      }

      // ====== SUMÁRIO + RESUMO GERAL na página 2 ======
      setPage(tocPage);
      const lh = lineHeight(12);
      const maxW = width - margin * 2 - 64;

      for (const item of tocItems) {
        const lines = wrapText(item.title, fontRegular, 12, maxW);
        for (let i = 0; i < lines.length; i++) {
          ensure(lh);
          const line = lines[i];
          const pageLabel = String(item.page);

          page.drawText(line, { x, y: y - lh + 3, size: 12, font: fontRegular });

          const lineWidth = fontRegular.widthOfTextAtSize(line, 12);
          const dotsStart = x + lineWidth + 8;
          const numWidth = fontRegular.widthOfTextAtSize(pageLabel, 12);
          const dotsEnd = width - margin - numWidth - 6;
          if (dotsEnd > dotsStart) {
            const dotY = y - lh / 2 + 3;
            for (let dx = dotsStart; dx < dotsEnd; dx += 3.5) {
              page.drawCircle({ x: dx, y: dotY, size: 0.6, color: LIGHT });
            }
          }
          page.drawText(pageLabel, { x: width - margin - numWidth, y: y - lh + 3, size: 12, font: fontRegular });
          y -= lh;
        }
      }

      y -= 10;
      afterTocYStart();
      heading("Resumo geral", 16, rgb(0.15, 0.62, 0.45));
      bulletList(resumoLinhas, 12);
    }

    // salva
    const pdfBytes = await pdfDoc.save();
    const ab: ArrayBuffer = (() => {
      const out = new ArrayBuffer(pdfBytes.byteLength);
      new Uint8Array(out).set(pdfBytes);
      return out;
    })();

    return new Response(ab, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${formId}-report.pdf"`,
        "Content-Length": String(pdfBytes.byteLength),
      },
    });
  } catch (e) {
    console.error("[/api/pdf/report] ERROR:", e);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
