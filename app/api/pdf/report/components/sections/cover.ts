// app/api/forms/pdf/report/components/sections/cover.ts
import { rgb } from "pdf-lib";
import { lineHeight, wrapText, type LayoutCtx } from "../layout";
import type { EnsureFn } from "../primitives";
import { paragraph, subheading, bulletList } from "../primitives";
import { callout } from "../blocks";

function justifiedParagraph(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  text: string,
  size: number,
  color: any,
  opts?: { maxW?: number; extraLineGap?: number; indent?: number }
) {
  const maxW = opts?.maxW ?? (ctx.width - ctx.margin * 2);
  const extraLineGap = opts?.extraLineGap ?? 2;
  const indent = opts?.indent ?? 0;

  // quebra em palavras (mantém pontuação junto)
  const words = text.trim().replace(/\s+/g, " ").split(" ");
  const spaceW = ctx.fontRegular.widthOfTextAtSize(" ", size);

  // monta linhas por largura
  const lines: string[][] = [];
  let line: string[] = [];
  let lineW = 0;

  for (const w of words) {
    const wW = ctx.fontRegular.widthOfTextAtSize(w, size);
    const nextW = line.length === 0 ? wW : lineW + spaceW + wW;

    if (nextW <= maxW - (lines.length === 0 ? indent : 0)) {
      line.push(w);
      lineW = nextW;
    } else {
      lines.push(line);
      line = [w];
      lineW = wW;
    }
  }
  if (line.length) lines.push(line);

  // desenha
  for (let i = 0; i < lines.length; i++) {
    const isLast = i === lines.length - 1;
    const wordsLine = lines[i];

    const x0 = ctx.margin + (i === 0 ? indent : 0);
    const lineMaxW = maxW - (i === 0 ? indent : 0);

    // altura
    ensure(ctx, lineHeight(size) + extraLineGap);
    const y = ctx.y - lineHeight(size) + 3;

    // última linha: não justifica (fica à esquerda)
    if (isLast || wordsLine.length === 1) {
      ctx.page.drawText(wordsLine.join(" "), {
        x: x0,
        y,
        size,
        font: ctx.fontRegular,
        color,
      });
      ctx.y -= lineHeight(size) + extraLineGap;
      continue;
    }

    // calcula o total sem espaços
    let wordsOnlyW = 0;
    for (const w of wordsLine) wordsOnlyW += ctx.fontRegular.widthOfTextAtSize(w, size);

    const gaps = wordsLine.length - 1;
    const extraSpace = Math.max(0, lineMaxW - wordsOnlyW);
    const gapW = extraSpace / gaps;

    // desenha palavra por palavra distribuindo o espaço
    let x = x0;
    for (let j = 0; j < wordsLine.length; j++) {
      const w = wordsLine[j];
      ctx.page.drawText(w, {
        x,
        y,
        size,
        font: ctx.fontRegular,
        color,
      });
      x += ctx.fontRegular.widthOfTextAtSize(w, size);
      if (j < wordsLine.length - 1) x += gapW; // espaço justificado
    }

    ctx.y -= lineHeight(size) + extraLineGap;
  }
}

function spacer(ctx: LayoutCtx, ensure: EnsureFn, h: number) {
  ensure(ctx, h + 2);
  ctx.y -= h;
}

export function renderCover(ctx: LayoutCtx, ensure: EnsureFn) {
  const page = ctx.page;
  const { PRIMARY, BG } = ctx.theme;
  const { width, height } = page.getSize();

  // Fundo
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG });

  // Faixa superior
  const bandH = 170;
  page.drawRectangle({ x: 0, y: height - bandH, width, height: bandH, color: PRIMARY });

  // Header melhor: maior, quebra em 2 linhas e centraliza verticalmente
  const titleX = ctx.margin;
  const maxW = width - ctx.margin - titleX;

  const TITLE = "Programa de Autoconhecimento Aplicado à Docência na UFSM";
  const SUB = "Relatório Completo Personalizado";

  let titleSize = 28;     // maior
  const titleMin = 18;
  const subSize = 16;     // maior também
  const gap = 10;         // espaço entre título e subtítulo

  // garante no máximo 2 linhas (vai reduzindo tamanho até caber)
  let titleLines = wrapText(TITLE, ctx.fontBold, titleSize, maxW);
  while (titleLines.length > 2 && titleSize > titleMin) {
    titleSize -= 1;
    titleLines = wrapText(TITLE, ctx.fontBold, titleSize, maxW);
  }
  // se ainda der 3+ linhas (bem improvável), corta pra 2 por segurança
  if (titleLines.length > 2) titleLines = [titleLines[0], titleLines[1]];

  // calcula altura do bloco e centraliza dentro da faixa azul
  const blockH =
    titleLines.length * lineHeight(titleSize) +
    gap +
    lineHeight(subSize);

  let yTop = height - (bandH - blockH) / 2; // topo virtual do bloco dentro da faixa

  // desenha linhas do título
  for (const line of titleLines) {
    page.drawText(line, {
      x: titleX,
      y: yTop - titleSize,
      size: titleSize,
      font: ctx.fontBold,
      color: rgb(1, 1, 1),
    });
    yTop -= lineHeight(titleSize);
  }

  // subtítulo
  yTop -= gap;

  page.drawText(SUB, {
    x: titleX,
    y: yTop - subSize,
    size: subSize,
    font: ctx.fontRegular,
    color: rgb(1, 1, 1),
  });

  // Início do conteúdo com mais respiro abaixo da faixa
  ctx.y = height - ctx.margin - bandH + 25;

  // 1) Callout (Importante)
  callout(
    ctx,
    ensure,
    "Importante",
    "Este relatório é um recurso de autodesenvolvimento e reflexão. Ele não substitui psicoterapia ou avaliação clínica.",
    "danger"
  );

  spacer(ctx, ensure, 10);

  justifiedParagraph(
    ctx,
    ensure,
    "Olá, docente! Este é seu Relatório Completo Personalizado do Programa de Autoconhecimento Aplicado à Docência na UFSM. Aqui você encontrará um feedback personalizado e mais aprofundado sobre as características dos seus fatores de personalidade, baseado nos escores dos formulários que você respondeu. Para cada característica, você saberá um pouco mais sobre as vantagens, as dificuldades e as estratégias de desenvolvimento possíveis. Esperamos que essa ferramenta possa apoiar seu desenvolvimento pessoal e profissional.",
    13,
    ctx.theme.TEXT,
    { extraLineGap: 2, indent: 0 }
  );


  spacer(ctx, ensure, 14);

  // 4) Callout Big Five
  callout(
    ctx,
    ensure,
    "Personalidade (Big Five)",
    "A seguir, veja um resumo rápido do que cada fator costuma representar. Lembre-se: não existe “bom” ou “ruim” — o objetivo é entender tendências e usar isso como ponto de partida para reflexão e desenvolvimento.",
    "info"
  );

  bulletList(
    ctx,
    ensure,
    [
      "Abertura: curiosidade, criatividade e interesse por novas ideias e experiências.",
      "Conscienciosidade: organização, disciplina, responsabilidade e foco em cumprir metas.",
      "Extroversão: energia social, comunicação, entusiasmo e facilidade para interações.",
      "Amabilidade: empatia, cooperação, cordialidade e preocupação com o outro.",
      "Neuroticismo: sensibilidade ao estresse, variações emocionais e tendência a preocupações.",
    ],
    13
  );



  spacer(ctx, ensure, 6);
}
