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

  const WHITE = rgb(1, 1, 1);

  // ------ Layout base ------
  const marginX = 56;
  const colGap = 34;

  const innerW = width - marginX * 2;
  const colW = (innerW - colGap * 2) / 3;

  const x1 = marginX;
  const x2 = marginX + colW + colGap;
  const x3 = marginX + (colW + colGap) * 2;

  const titleSize = 11;
  const textSize = 10;

  const titleStep = lineHeight(titleSize) + 2;
  const textStep = lineHeight(textSize) + 2;

  const topLinePad = 22;      // distância da linha até o topo do footer
  const afterLinePad = 22;    // distância da linha até começar o conteúdo
  const bottomPad = 22;

  // ------ Helpers ------
  const drawLines = (
    x: number,
    yStart: number,
    lines: string[],
    size: number,
    font: any,
    step: number
  ) => {
    let y = yStart;
    for (const ln of lines) {
      page.drawText(ln, { x, y, size, font, color: WHITE });
      y -= step;
    }
    return y;
  };

  const drawWrapped = (
    x: number,
    yStart: number,
    text: string,
    font: any,
    size: number,
    step: number,
    maxW: number
  ) => drawLines(x, yStart, wrapText(text, font, size, maxW), size, font, step);

  const countWrapped = (text: string, font: any, size: number, maxW: number) =>
    wrapText(text, font, size, maxW).length;

  // ------ Conteúdo (editável) ------
  const col1TitleA = "COORDENADORIA DE AÇÕES EDUCACIONAIS -";
  const col1TitleB = "CAED/PROGRAD";

  const addrLines = [
    "Av. Roraima nº 1000",
    "Prédio 67",
    "Cidade Universitária",
    "Bairro Camobi",
    "Santa Maria - RS",
    "CEP: 97105-900",
  ];

  const phoneText = "Telefone: +55 (55) 3220-9622";
  const emailText = "Email: equipeedusaudecaed@ufsm.br";

  const teamTitle = "Equipe";
  const teamItems = [
    "Renato Favarin Dos Santos (Psicólogo-CAEd/PROGRAD)",
    "Ana Júlia Vicentini (Psicóloga-CAEd/PROGRAD)",
    "Dante Dardaque Santos (Sistemas de Informação-UFSM)",
  ];

  // ------ Estimar altura necessária (pra não cortar nem invadir) ------
  const col1H =
    (countWrapped(col1TitleA, ctx.fontBold, titleSize, colW) + 1) * titleStep + // +1 pro "CAED/PROGRAD"
    8 +
    addrLines.length * textStep;

  const col2H =
    countWrapped("Contato e Informações", ctx.fontBold, titleSize, colW) * titleStep +
    8 +
    countWrapped(phoneText, ctx.fontRegular, textSize, colW) * textStep +
    countWrapped(emailText, ctx.fontRegular, textSize, colW) * textStep;

  const teamWrappedLines = teamItems.flatMap((t) =>
    wrapText(t, ctx.fontRegular, textSize, colW)
  );
  const col3H =
    countWrapped(teamTitle, ctx.fontBold, titleSize, colW) * titleStep +
    8 +
    teamWrappedLines.length * textStep;

  const contentH = Math.max(col1H, col2H, col3H);

  // footer mínimo + auto
  const minBandH = 240;
  const bandH = Math.max(minBandH, topLinePad + afterLinePad + contentH + bottomPad);

  // ------ Desenho do footer ------
  // fundo
  page.drawRectangle({ x: 0, y: 0, width, height: bandH, color: PRIMARY });

  // linha no topo do footer
  const lineY = bandH - topLinePad;
  page.drawLine({
    start: { x: 30, y: lineY },
    end: { x: width - 30, y: lineY },
    thickness: 1,
    color: WHITE,
    opacity: 0.35,
  });

  // topo do conteúdo (logo abaixo da linha)
  const y0 = lineY - afterLinePad;

  // ===== COLUNA 1 =====
  let y1 = y0;
  y1 = drawWrapped(x1, y1, col1TitleA, ctx.fontBold, titleSize, titleStep, colW);
  page.drawText(col1TitleB, { x: x1, y: y1, size: titleSize, font: ctx.fontBold, color: WHITE });
  y1 -= titleStep + 6;
  y1 = drawLines(x1, y1, addrLines, textSize, ctx.fontRegular, textStep);

  // ===== COLUNA 2 =====
  let y2 = y0;
  y2 = drawWrapped(x2, y2, "Contato e Informações", ctx.fontBold, titleSize, titleStep, colW);
  y2 -= 6;
  y2 = drawWrapped(x2, y2, phoneText, ctx.fontRegular, textSize, textStep, colW);
  y2 = drawWrapped(x2, y2, emailText, ctx.fontRegular, textSize, textStep, colW); // ✅ agora na coluna 2

  // ===== COLUNA 3 =====
  let y3 = y0;
  y3 = drawWrapped(x3, y3, teamTitle, ctx.fontBold, titleSize, titleStep, colW);
  y3 -= 6;
  y3 = drawLines(x3, y3, teamWrappedLines, textSize, ctx.fontRegular, textStep);
}
