// app/api/forms/pdf/report/components/sections/cover.ts
import { rgb } from "pdf-lib";
import type { LayoutCtx } from "../layout";
import type { EnsureFn } from "../primitives";
import { paragraph, subheading, bulletList } from "../primitives";
import { callout } from "../blocks";

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

  // Títulos (um pouco mais espaçados)
  const titleX = ctx.margin;
  const titleTopPad = 26;

  const title1Size = 24;
  const title2Size = 18;

  const title1Y = height - titleTopPad - title1Size; // base aproximada
  const titleGap = 14;

  page.drawText("Programa de Autoconhecimento Docente", {
    x: titleX,
    y: title1Y,
    size: title1Size,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Relatório Completo Personalizado", {
    x: titleX,
    y: title1Y - title2Size - titleGap,
    size: title2Size,
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

  // 2) Parágrafo de introdução
  paragraph(
    ctx,
    ensure,
    "O Programa de Autoconhecimento é um processo estruturado que busca apoiar docentes da UFSM no desenvolvimento pessoal e profissional.",
    12,
    ctx.theme.TEXT
  );

  spacer(ctx, ensure, 8);

  // 3) Objetivos
  subheading(ctx, ensure, "Objetivos do Programa", 15, ctx.theme.PRIMARY);
  spacer(ctx, ensure, 4);

  bulletList(
    ctx,
    ensure,
    [
      "Explorar características pessoais, valores e motivações.",
      "Promover equilíbrio entre vida profissional e pessoal.",
      "Fomentar a saúde mental e o bem-estar docente.",
      "Desenvolver habilidades de comunicação e relações interpessoais.",
      "Aprimorar o gerenciamento do estresse acadêmico.",
      "Fortalecer o crescimento e preparo para desafios futuros.",
    ],
    12
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
    12
  );



  spacer(ctx, ensure, 6);
}
