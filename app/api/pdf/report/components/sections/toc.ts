// components/sections/toc.ts
import type { PDFDocument } from "pdf-lib";
import type { LayoutCtx } from "../layout";
import type { EnsureFn } from "../primitives";
import type { TocFactorEntry } from "../data.ts";
import { setPage, lineHeight, wrapText } from "../layout";
import { drawHeader } from "../header-footer";
import { heading, divider } from "../primitives";

export function createTocPage(pdfDoc: PDFDocument, ctx: LayoutCtx, ensure: EnsureFn) {
  const tocPage = pdfDoc.addPage();
  setPage(ctx, tocPage, pdfDoc.getPages().length - 1);
  drawHeader(ctx);

  heading(ctx, ensure, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx, ensure);

  const tocStartY = ctx.y;
  return { tocPage, tocStartY };
}

export function renderToc(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  tocPage: any,
  tocStartY: number,
  tocFactors: TocFactorEntry[]
) {
  setPage(ctx, tocPage, 1);
  drawHeader(ctx);
  heading(ctx, ensure, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx, ensure);

  ctx.y = tocStartY;

  const rowH = 16;
  const facetaSize = 14;
  const facetaIndent = 20;
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

    ctx.page.drawText("........................................................................", {
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

    if (it.facetas?.length) {
      const bulletIndentExtra = 12;

      for (const faceta of it.facetas) {
        const lines = wrapText(`• ${faceta}`, ctx.fontRegular, facetaSize, facetaMaxW);

        for (let i = 0; i < lines.length; i++) {
          ensure(ctx, lineHeight(facetaSize) + 2);

          ctx.page.drawText(lines[i], {
            x: ctx.margin + facetaIndent + (i === 0 ? 0 : bulletIndentExtra),
            y: ctx.y - lineHeight(facetaSize) + 3,
            size: facetaSize,
            font: ctx.fontRegular,
            color: ctx.theme.MUTED,
          });

          ctx.y -= lineHeight(facetaSize);
        }

        ctx.y -= 2;
      }

      ctx.y -= 6;
    }
  }
}
