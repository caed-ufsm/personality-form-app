// components/sections/toc.ts
import { PDFArray, PDFName, type PDFDocument } from "pdf-lib";
import type { LayoutCtx } from "../layout";
import type { EnsureFn } from "../primitives";
import type { TocFactorEntry } from "../data";
import { setPage, lineHeight, wrapText } from "../layout";
import { drawHeader } from "../header-footer";
import { heading, divider } from "../primitives";

/** ---------------- LINK / ANNOT (GoTo page) ---------------- */
function addGoToPageLink(
  ctx: LayoutCtx,
  fromPageIndex: number,
  rect: { x: number; y: number; w: number; h: number },
  toPageIndex: number
) {
  const pdfDoc = ctx.pdfDoc as PDFDocument | undefined;
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

/** Cria a página do sumário e devolve o índice real + Y inicial */
export function createTocPage(pdfDoc: PDFDocument, ctx: LayoutCtx, ensure: EnsureFn) {
  const tocPage = pdfDoc.addPage();
  const tocPageIndex = pdfDoc.getPages().length - 1;

  setPage(ctx, tocPage, tocPageIndex);
  drawHeader(ctx);

  heading(ctx, ensure, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx, ensure);

  const tocStartY = ctx.y;
  return { tocPage, tocStartY, tocPageIndex };
}

export function renderToc(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  tocPage: any,
  tocPageIndex: number,
  tocStartY: number,
  tocFactors: TocFactorEntry[]
) {
  setPage(ctx, tocPage, tocPageIndex);
  drawHeader(ctx);
  heading(ctx, ensure, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx, ensure);

  ctx.y = tocStartY;

  // estilos (parecido com teu sumário atual do builder)
  const factorSize = 12;
  const factorRowH = 18;

  const facetaSize = 11;
  const facetaIndent = 18;
  const bulletX = ctx.margin + facetaIndent + 5;
  const textX = bulletX + 12;
  const rightPad = 10;

  for (const it of tocFactors) {
    // ---------- FATOR ----------
    ensure(ctx, factorRowH + 10);

    const left = it.label;
    const right = String(it.page);

    const yFactor = ctx.y - lineHeight(factorSize) + 3;

    // barra de destaque
    ctx.page.drawRectangle({
      x: ctx.margin - 8,
      y: yFactor - 2,
      width: 3,
      height: lineHeight(factorSize) - 1,
      color: ctx.theme.ACCENT,
    });

    ctx.page.drawText(left, {
      x: ctx.margin,
      y: yFactor,
      size: factorSize,
      font: ctx.fontBold,
      color: ctx.theme.TEXT,
    });

    const rightW = ctx.fontBold.widthOfTextAtSize(right, factorSize);
    const xRight = ctx.width - ctx.margin - rightW;

    // dots dinâmicos
    const leftW = ctx.fontBold.widthOfTextAtSize(left, factorSize);
    const dotsStart = ctx.margin + leftW + 10;
    const dotsEnd = xRight - 8;

    if (dotsEnd > dotsStart + 14) {
      const dotW = ctx.fontRegular.widthOfTextAtSize(".", 9);
      const n = Math.floor((dotsEnd - dotsStart) / dotW);
      if (n >= 8) {
        ctx.page.drawText(".".repeat(n), {
          x: dotsStart,
          y: yFactor + 1,
          size: 9,
          font: ctx.fontRegular,
          color: ctx.theme.DIVIDER,
        });
      }
    }

    ctx.page.drawText(right, {
      x: xRight,
      y: yFactor,
      size: factorSize,
      font: ctx.fontBold,
      color: ctx.theme.MUTED,
    });

    // link do fator (linha inteira)
    addGoToPageLink(
      ctx,
      tocPageIndex,
      {
        x: ctx.margin - 8,
        y: yFactor - 4,
        w: ctx.width - (ctx.margin - 8) - ctx.margin,
        h: lineHeight(factorSize) + 8,
      },
      (it.page ?? 1) - 1
    );

    ctx.y -= factorRowH;
    ctx.y -= 6;

    // ---------- FACETAS ----------
    if (it.facetas?.length) {
      for (const f of it.facetas) {
        const label = String((f as any).label ?? f); // compatibilidade
        const pageNum = String((f as any).page ?? "");

        const pageW = ctx.fontBold.widthOfTextAtSize(pageNum, facetaSize);
        const xRightF = ctx.width - ctx.margin - pageW;

        const textMaxW = Math.max(80, (xRightF - rightPad) - textX);
        const lines = wrapText(label, ctx.fontRegular, facetaSize, textMaxW);

        for (let i = 0; i < lines.length; i++) {
          ensure(ctx, lineHeight(facetaSize) + 2);

          const y = ctx.y - lineHeight(facetaSize) + 3;

          // bolinha só na primeira linha
          if (i === 0) {
            ctx.page.drawCircle({
              x: bulletX,
              y: y + facetaSize * 0.36,
              size: 1.4,
              color: ctx.theme.ACCENT,
            });
          }

          ctx.page.drawText(lines[i] ?? "", {
            x: textX + (i === 0 ? 0 : 10),
            y,
            size: facetaSize,
            font: ctx.fontRegular,
            color: ctx.theme.MUTED,
          });

          // leader + número só na primeira linha
          if (i === 0 && pageNum) {
            const firstLine = lines[0] ?? "";
            const firstW = ctx.fontRegular.widthOfTextAtSize(firstLine, facetaSize);

            const leaderStart = textX + firstW + 8;
            const leaderEnd = xRightF - 8;

            if (leaderEnd > leaderStart + 14) {
              const dotW = ctx.fontRegular.widthOfTextAtSize(".", 9);
              const n = Math.floor((leaderEnd - leaderStart) / dotW);
              if (n >= 8) {
                ctx.page.drawText(".".repeat(n), {
                  x: leaderStart,
                  y: y + 1,
                  size: 9,
                  font: ctx.fontRegular,
                  color: ctx.theme.DIVIDER,
                });
              }
            }

            ctx.page.drawText(pageNum, {
              x: xRightF,
              y,
              size: facetaSize,
              font: ctx.fontBold,
              color: ctx.theme.MUTED,
            });

            // link da faceta (somente na 1ª linha, clicável na linha inteira)
            addGoToPageLink(
              ctx,
              tocPageIndex,
              {
                x: ctx.margin,
                y: y - 4,
                w: ctx.width - ctx.margin * 2,
                h: lineHeight(facetaSize) + 8,
              },
              (Number((f as any).page ?? 1) || 1) - 1
            );
          }

          ctx.y -= lineHeight(facetaSize);
        }

        ctx.y -= 2;
      }

      ctx.y -= 6;
    }
  }
}
