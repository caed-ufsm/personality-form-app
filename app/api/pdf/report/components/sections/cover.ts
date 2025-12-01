// app/api/forms/pdf/report/components/sections/cover.ts
import { rgb } from "pdf-lib";
import type { LayoutCtx } from "../layout";
import type { EnsureFn } from "../primitives";
import { callout } from "../blocks";
import { paragraph, subheading, bulletList } from "../primitives";

export function renderCover(ctx: LayoutCtx, ensure: EnsureFn) {
  const page = ctx.page;
  const { PRIMARY, BG } = ctx.theme;
  const { width, height } = page.getSize();

  // Fundo e faixa superior
  page.drawRectangle({ x: 0, y: 0, width, height, color: BG });
  page.drawRectangle({ x: 0, y: height - 170, width, height: 170, color: PRIMARY });

  // Títulos
  page.drawText("Programa de Autoconhecimento Docente", {
    x: ctx.margin,
    y: height - 96,
    size: 24,
    font: ctx.fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Relatório Completo Personalizado", {
    x: ctx.margin,
    y: height - 126,
    size: 18,
    font: ctx.fontRegular,
    color: rgb(1, 1, 1),
  });

  // Posição inicial do cursor
  ctx.y = height - ctx.margin - 190;

  callout(
    ctx,
    ensure,
    "Importante",
    "Este relatório é um recurso de autodesenvolvimento e reflexão. Ele não substitui psicoterapia ou avaliação clínica.",
    "danger"
  );

  paragraph(
    ctx,
    ensure,
    "O Programa de Autoconhecimento é um processo estruturado que busca apoiar docentes da UFSM no desenvolvimento pessoal e profissional.",
    12,
    ctx.theme.TEXT
  );

  subheading(ctx, ensure, "Objetivos do Programa", 15, ctx.theme.PRIMARY);

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

  callout(
    ctx,
    ensure,
    "Personalidade (Big Five)",
    "Os formulários utilizam os Cinco Grandes Fatores da Personalidade — Abertura, Conscienciosidade, Extroversão, Amabilidade e Neuroticismo — para compreender como diferentes traços influenciam atitudes, comportamentos e potencial de crescimento pessoal.",
    "info"
  );
}
