// app/api/forms/pdf/report/header-footer.ts
import { rgb } from "pdf-lib";
import type { LayoutCtx } from "./layout";
import { setPage } from "./layout";

/** Cabeçalho padrão (fundo + barra superior + título) */
export function drawHeader(ctx: LayoutCtx) {
  const { PRIMARY, BG } = ctx.theme;

  // fundo
  ctx.page.drawRectangle({
    x: 0,
    y: 0,
    width: ctx.width,
    height: ctx.height,
    color: BG,
  });

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

/** Rodapé padrão (linha + paginação) */
export function drawFooter(ctx: LayoutCtx, pageNumber: number, totalPages: number) {
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

/** Abre uma nova página de conteúdo e redesenha o cabeçalho */
export function openContentPage(ctx: LayoutCtx) {
  const p = ctx.pdfDoc.addPage();
  const idx = ctx.pdfDoc.getPages().length - 1;

  setPage(ctx, p, idx);
  drawHeader(ctx);
}
