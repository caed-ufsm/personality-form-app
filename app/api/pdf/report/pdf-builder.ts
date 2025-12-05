// app/api/forms/pdf/report/pdf-builder.ts
import { PDFDocument, StandardFonts, PDFName, PDFArray } from "pdf-lib";

import type { OneForm, TocFactorEntry } from "./components/data";

import {
  newLayout,
  setPage,
  type LayoutCtx,
  ensure as ensureBase,
} from "./components/layout";

import { drawFinalFooterCAED, drawFooter, openContentPage } from "./components/header-footer";

import { divider, paragraph, heading, subheading } from "./components/primitives";
import { callout } from "./components/blocks";

import { renderCover } from "./components/sections/cover";
import { renderFactors } from "./components/sections/factor";

// ✅ usa teu toc.ts
import { createTocPage, renderToc } from "./components/sections/toc";

function spacer(ctx: LayoutCtx, ensureFn: (ctx: LayoutCtx, needed: number) => void, h: number) {
  ensureFn(ctx, h + 2);
  ctx.y -= h;
}

/** ---------------- LINK / ANNOT (GoTo page) ---------------- */
function addGoToPageLink(
  ctx: LayoutCtx,
  fromPageIndex: number,
  rect: { x: number; y: number; w: number; h: number },
  toPageIndex: number
) {
  const pdfDoc = (ctx.pdfDoc as PDFDocument) ?? undefined;
  if (!pdfDoc) return;

  const pages = pdfDoc.getPages();
  const fromPage = pages[fromPageIndex];
  const toPage = pages[toPageIndex];
  if (!fromPage || !toPage) return;

  const x1 = rect.x;
  const y1 = rect.y;
  const x2 = rect.x + rect.w;
  const y2 = rect.y + rect.h;

  const dest = pdfDoc.context.obj([toPage.ref, PDFName.of("Fit")]);

  const linkAnnot = pdfDoc.context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("Link"),
    Rect: [x1, y1, x2, y2],
    Border: [0, 0, 0],
    Dest: dest,
  });

  let annots = fromPage.node.lookup(PDFName.of("Annots"), PDFArray) as PDFArray | undefined;
  if (!annots) {
    annots = pdfDoc.context.obj([]) as PDFArray;
    fromPage.node.set(PDFName.of("Annots"), annots);
  }

  annots.push(linkAnnot);
}

/** ---------------- BOTÃO "VOLTAR AO SUMÁRIO" ---------------- */
function drawBackToTocButton(ctx: LayoutCtx, tocPageIndex: number) {
  if (tocPageIndex < 0) return;
  if (ctx.pageIndex === tocPageIndex) return; // não desenhar no sumário
  if (ctx.pageIndex === ctx.coverIndex) return; // não desenhar na capa

  const { width, height } = ctx.page.getSize();

  const btnW = 88;
  const btnH = 22;

  const x = width - ctx.margin - btnW;
  const y = height - 40;

  ctx.page.drawRectangle({
    x,
    y,
    width: btnW,
    height: btnH,
    color: ctx.theme.BG,
    borderColor: ctx.theme.ACCENT,
    borderWidth: 1,
  });

  const label = "Voltar";
  const fontSize = 10;
  const textW = ctx.fontBold.widthOfTextAtSize(label, fontSize);

  ctx.page.drawText(label, {
    x: x + (btnW - textW) / 2,
    y: y + 6,
    size: fontSize,
    font: ctx.fontBold,
    color: ctx.theme.PRIMARY,
  });

  addGoToPageLink(ctx, ctx.pageIndex, { x, y, w: btnW, h: btnH }, tocPageIndex);
}

/** ---------------- PAGE OPEN WRAPPER (com botão) ---------------- */
let TOC_PAGE_INDEX = -1;

function openContentPageWithBack(ctx: LayoutCtx) {
  openContentPage(ctx);
  if (TOC_PAGE_INDEX >= 0) drawBackToTocButton(ctx, TOC_PAGE_INDEX);
}

function ensure(ctx: LayoutCtx, needed: number) {
  ensureBase(ctx, needed, openContentPageWithBack);
}

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
  renderCover(ctx, ensure);

  /** ---------------- SUMÁRIO (criado via toc.ts) ---------------- */
  const { tocPage, tocStartY, tocPageIndex } = createTocPage(pdfDoc, ctx, ensure);
  TOC_PAGE_INDEX = tocPageIndex;

  // será preenchido durante renderFactors
  const tocFactors: TocFactorEntry[] = [];

  /** ---------------- CONTEÚDO ---------------- */
  renderFactors(ctx, ensure, forms, tocFactors, openContentPageWithBack);

  /** ---------------- ENCERRAMENTO ---------------- */
  openContentPageWithBack(ctx);

  heading(ctx, ensure, "Mensagem final", 22, ctx.theme.PRIMARY);
  divider(ctx, ensure);

  callout(
    ctx,
    ensure,
    "",
    "Esperamos que este relatório tenha proporcionado insights valiosos sobre seu perfil e contribuído para o seu desenvolvimento pessoal e profissional.",
    "info"
  );

  spacer(ctx, ensure, 10);

  paragraph(
    ctx,
    ensure,
    "Lembre-se: autoconhecimento é uma jornada contínua. Use estas informações como ponto de partida para reflexões, ajustes na rotina e fortalecimento de habilidades pessoais e profissionais.",
    12,
    ctx.theme.TEXT
  );

  spacer(ctx, ensure, 10);

  paragraph(
    ctx,
    ensure,
    "Agradecemos por participar do Programa de Autoconhecimento Docente.",
    12,
    ctx.theme.TEXT,
    true
  );

  spacer(ctx, ensure, 6);

  subheading(ctx, ensure, "Contato", 12, ctx.theme.PRIMARY);
  spacer(ctx, ensure, 3);

  paragraph(
    ctx,
    ensure,
    "Para suporte, dúvidas ou sugestões: equipeedusaudecaed@ufsm.br",
    11,
    ctx.theme.TEXT
  );

  spacer(ctx, ensure, 12);

  divider(ctx, ensure);

  paragraph(
    ctx,
    ensure,
    "Aviso de uso: este relatório foi elaborado para fins informativos e de desenvolvimento pessoal. Apesar de tratar do seu perfil, pedimos que o conteúdo não seja copiado, reproduzido ou distribuído (integral ou parcialmente) sem autorização dos autores/responsáveis pelo material.",
    9.5,
    ctx.theme.MUTED
  );

  drawFinalFooterCAED(ctx);

  /** ---------------- RENDERIZAR SUMÁRIO (via toc.ts) ---------------- */
  renderToc(ctx, ensure, tocPage, tocPageIndex, tocStartY, tocFactors);

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
