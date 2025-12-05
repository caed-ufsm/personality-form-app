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


export function drawFinalFooterCAED(ctx: LayoutCtx) {
  const page = ctx.page;
  const { PRIMARY } = ctx.theme;
  const { width } = page.getSize();

  const bandH = 140; // altura do footer (ajusta se quiser)

  // fundo
  page.drawRectangle({ x: 0, y: 0, width, height: bandH, color: PRIMARY });

  // linha fina no topo do footer
  page.drawLine({
    start: { x: 30, y: bandH - 18 },
    end: { x: width - 30, y: bandH - 18 },
    thickness: 1,
    color: rgb(1, 1, 1),
    opacity: 0.35,
  });

  const marginX = 48; // padding lateral interno do footer
  const topPad = 36;  // padding do topo (abaixo da linha)
  const colGap = 26;

  const innerW = width - marginX * 2;
  const colW = (innerW - colGap * 2) / 3;

  const x1 = marginX;
  const x2 = marginX + colW + colGap;
  const x3 = marginX + (colW + colGap) * 2;

  const titleSize = 11;
  const textSize = 10;
  const titleLH = lineHeight(titleSize);
  const textLH = lineHeight(textSize);

  const WHITE = rgb(1, 1, 1);

  // baseline (começa do topo do footer e vai descendo)
  const y0 = bandH - topPad;

  // ------- COLUNA 1 (Endereço) -------
  let y = y0;

  page.drawText("COORDENADORIA DE AÇÕES EDUCACIONAIS -", {
    x: x1,
    y,
    size: titleSize,
    font: ctx.fontBold,
    color: WHITE,
  });
  y -= titleLH;

  page.drawText("CAED/PROGRAD", {
    x: x1,
    y,
    size: titleSize,
    font: ctx.fontBold,
    color: WHITE,
  });
  y -= titleLH + 6;

  const addrLines = [
    "Av. Roraima nº 1000",
    "Prédio 67",
    "Cidade Universitária",
    "Bairro Camobi",
    "Santa Maria - RS",
    "CEP: 97105-900",
  ];

  for (const line of addrLines) {
    page.drawText(line, {
      x: x1,
      y,
      size: textSize,
      font: ctx.fontRegular,
      color: WHITE,
    });
    y -= textLH + 2;
  }

  // ------- COLUNA 2 (Contato) -------
  y = y0;

  page.drawText("Contato e Informações", {
    x: x2,
    y,
    size: titleSize,
    font: ctx.fontBold,
    color: WHITE,
  });
  y -= titleLH + 10;

  page.drawText("Telefone: +55 (55) 3220-9622", {
    x: x2,
    y,
    size: textSize,
    font: ctx.fontRegular,
    color: WHITE,
  });

  // ------- COLUNA 3 (Email) -------
  y = y0 - (titleLH + 10); // alinha com a linha do telefone

  page.drawText("Email: equipeedusaudecaed@ufsm.br", {
    x: x3,
    y,
    size: textSize,
    font: ctx.fontRegular,
    color: WHITE,
  });
}
