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

  // ✅ footer maior (começa mais em cima)
  const bandH = 350;

  // fundo
  page.drawRectangle({ x: 0, y: 0, width, height: bandH, color: PRIMARY });

  // linha no topo do footer
  const lineY = bandH - 22;
  page.drawLine({
    start: { x: 30, y: lineY },
    end: { x: width - 30, y: lineY },
    thickness: 1,
    color: rgb(1, 1, 1),
    opacity: 0.35,
  });

  const marginX = 56;
  const colGap = 34;

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

  // topo do conteúdo (logo abaixo da linha)
  const y0 = lineY - 22;

  // helper pra desenhar lista de linhas
  function drawLines(
    x: number,
    yStart: number,
    lines: string[],
    size: number,
    font: any,
    gapAfter = 0
  ) {
    let y = yStart;
    for (const ln of lines) {
      page.drawText(ln, { x, y, size, font, color: WHITE });
      y -= lineHeight(size) + 2;
    }
    return y - gapAfter;
  }

  // ===== COLUNA 1 =====
  let y = y0;

  // ✅ quebra o título grande pra não invadir a col2
  const col1Title = wrapText("COORDENADORIA DE AÇÕES EDUCACIONAIS -", ctx.fontBold, titleSize, colW);
  y = drawLines(x1, y, col1Title, titleSize, ctx.fontBold, 0);

  page.drawText("CAED/PROGRAD", { x: x1, y, size: titleSize, font: ctx.fontBold, color: WHITE });
  y -= titleLH + 8;

  const addrLines = [
    "Av. Roraima nº 1000",
    "Prédio 67",
    "Cidade Universitária",
    "Bairro Camobi",
    "Santa Maria - RS",
    "CEP: 97105-900",
  ];
  y = drawLines(x1, y, addrLines, textSize, ctx.fontRegular, 0);

  // ===== COLUNA 2 =====
  y = y0;

  const col2Title = wrapText("Contato e Informações", ctx.fontBold, titleSize, colW);
  y = drawLines(x2, y, col2Title, titleSize, ctx.fontBold, 8);

  page.drawText("Telefone: +55 (55) 3220-9622", {
    x: x2,
    y,
    size: textSize,
    font: ctx.fontRegular,
    color: WHITE,
  });

  // email
  const emailLines = wrapText("Email: equipeedusaudecaed@ufsm.br", ctx.fontRegular, textSize, colW);
  y = drawLines(x3, y, emailLines, textSize, ctx.fontRegular, 8);

  // ===== COLUNA 3 =====
  y = y0;

  // ✅ agora os nomes descem de verdade (sem sobrepor)
  const nomes = ["Renato Favarin Dos Santos (Psicólogo-CAEd/PROGRAD)", "Ana Júlia Vicentini (Psicóloga-CAEd/PROGRAD)", "Dante Dardaque Santos (Sistemas de Informação-UFSM) "];
  drawLines(x3, y, nomes, textSize, ctx.fontRegular, 0);
}
