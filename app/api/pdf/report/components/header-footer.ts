// components/header-footer.ts
import { rgb } from "pdf-lib";
import { lineHeight, wrapText, type LayoutCtx } from "./layout";
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

export function drawFinalFooter(ctx: LayoutCtx, opts?: { title?: string; subtitle?: string }) {
  const page = ctx.page;
  const { PRIMARY } = ctx.theme;
  const { width } = page.getSize();

  const bandH = 78; // altura da faixa do footer

  // faixa inferior
  page.drawRectangle({ x: 0, y: 0, width, height: bandH, color: PRIMARY });

  const title = opts?.title ?? "Programa de Autoconhecimento Aplicado à Docência na UFSM";
  const subtitle = opts?.subtitle ?? "Contato: equipeedusaudecaed@ufsm.br";

  const x = ctx.margin;
  const maxW = width - ctx.margin * 2;

  let titleSize = 12;
  const titleMin = 10;
  const subSize = 10;
  const gap = 6;

  // até 2 linhas (reduz o size se precisar)
  let titleLines = wrapText(title, ctx.fontBold, titleSize, maxW);
  while (titleLines.length > 2 && titleSize > titleMin) {
    titleSize -= 1;
    titleLines = wrapText(title, ctx.fontBold, titleSize, maxW);
  }
  if (titleLines.length > 2) titleLines = [titleLines[0], titleLines[1]];

  const blockH =
    titleLines.length * lineHeight(titleSize) +
    gap +
    lineHeight(subSize);

  // topo virtual do bloco dentro da faixa, centralizado verticalmente
  let yTop = bandH - (bandH - blockH) / 2;

  // título (linhas)
  for (const line of titleLines) {
    page.drawText(line, {
      x,
      y: yTop - titleSize,
      size: titleSize,
      font: ctx.fontBold,
      color: rgb(1, 1, 1),
    });
    yTop -= lineHeight(titleSize);
  }

  // subtítulo
  yTop -= gap;
  page.drawText(subtitle, {
    x,
    y: yTop - subSize,
    size: subSize,
    font: ctx.fontRegular,
    color: rgb(1, 1, 1),
  });
}
