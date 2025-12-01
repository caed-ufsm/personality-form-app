// app/api/forms/pdf/report/layout.ts
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import { makeTheme, type Theme } from "./theme";

/** ---------------- Layout types ---------------- */
export type LayoutCtx = {
  pdfDoc: PDFDocument;

  page: PDFPage;
  pageIndex: number;

  width: number;
  height: number;

  margin: number;
  headerH: number;
  footerH: number;

  x: number;
  y: number;

  fontRegular: PDFFont;
  fontBold: PDFFont;

  theme: Theme;
  headerTitle: string;

  coverIndex: number; // página da capa (index 0-based)
};

/** ---------------- Math helpers ---------------- */
export const lineHeight = (s: number) => s * 1.35;

/** ---------------- Page helpers ---------------- */
export function setPage(ctx: LayoutCtx, page: PDFPage, pageIndex: number) {
  ctx.page = page;
  ctx.pageIndex = pageIndex;

  const { width, height } = page.getSize();
  ctx.width = width;
  ctx.height = height;

  ctx.x = ctx.margin;
  ctx.y = ctx.height - ctx.margin - ctx.headerH;
}

export function newLayout(
  pdfDoc: PDFDocument,
  fontRegular: PDFFont,
  fontBold: PDFFont,
  headerTitle: string
): LayoutCtx {
  const theme = makeTheme();

  // mantém seus números atuais
  const margin = 56;
  const headerH = 44;
  const footerH = 28;

  const page = pdfDoc.addPage();
  const pageIndex = pdfDoc.getPages().length - 1;

  const { width, height } = page.getSize();

  const ctx: LayoutCtx = {
    pdfDoc,
    page,
    pageIndex,
    width,
    height,
    margin,
    headerH,
    footerH,
    x: margin,
    y: height - margin - headerH,
    fontRegular,
    fontBold,
    theme,
    headerTitle,
    coverIndex: pageIndex,
  };

  return ctx;
}

export function safeBottom(ctx: LayoutCtx) {
  return ctx.margin + ctx.footerH;
}

/**
 * Importante: pra evitar import circular, essa função recebe o callback que abre a página
 * (normalmente: openContentPage definido no pdf-builder, ou você pode usar o helper abaixo).
 */
export function ensure(ctx: LayoutCtx, needed: number, openPage: (ctx: LayoutCtx) => void) {
  if (ctx.y - needed < safeBottom(ctx)) openPage(ctx);
}

/** ---------------- Text wrap ---------------- */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = String(text || "").split(/\s+/);
  const lines: string[] = [];

  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);
  return lines;
}
