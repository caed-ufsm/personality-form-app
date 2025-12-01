// app/api/forms/pdf/report/pdf-builder.ts
import { PDFDocument, StandardFonts } from "pdf-lib";

import {
  FEEDBACKS,
  resolveFormKey,
  type FeedbackLevel,
  type OneForm,
  type TocFactorEntry,
} from "./components/data";

import { calcularMediaFaceta, nivelPorMedia } from "./components/scoring";

import {
  newLayout,
  setPage,
  lineHeight,
  wrapText,
  type LayoutCtx,
  ensure as ensureBase,
} from "./components/layout";

import { drawHeader, drawFooter, openContentPage } from "./components/header-footer";

import { callout, card, estimateCardHeight } from "./components/blocks";
import { divider, paragraph, heading, subheading, bulletList } from "./components/primitives";

import { renderCover } from "./components/sections/cover";

function ensure(ctx: LayoutCtx, needed: number) {
  ensureBase(ctx, needed, openContentPage);
}

export async function buildPdfReport(forms: OneForm[], opts?: { title?: string }): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const HEADER_TITLE = opts?.title?.trim() || "Relatório Completo Personalizado";
  const ctx = newLayout(pdfDoc, fontRegular, fontBold, HEADER_TITLE);

  /** ---------------- CAPA (extraída) ---------------- */
  renderCover(ctx, ensure);

  /** ---------------- SUMÁRIO (placeholder e preenchido no final) ---------------- */
  const tocPage = pdfDoc.addPage();
  setPage(ctx, tocPage, pdfDoc.getPages().length - 1);
  drawHeader(ctx);

  heading(ctx, ensure, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx, ensure);

  const tocStartY = ctx.y;

  // ✅ fator + facetas (vem do data.ts)
  const tocFactors: TocFactorEntry[] = [];

  /** ---------------- CONTEÚDO ---------------- */
  openContentPage(ctx);

  for (let i = 0; i < forms.length; i++) {
    const { id: formIdRaw, answers } = forms[i];
    const formKey = resolveFormKey(formIdRaw);

    if (i > 0) openContentPage(ctx);

    if (!formKey) {
      heading(ctx, ensure, `Fator: ${String(formIdRaw)}`, 22, ctx.theme.PRIMARY);
      paragraph(ctx, ensure, "Feedback não encontrado para este formulário.", 12, ctx.theme.MUTED);
      continue;
    }

    const fb = FEEDBACKS[formKey];
    const label = fb.titulo?.trim() || formKey.charAt(0).toUpperCase() + formKey.slice(1);

    // ✅ registra fator no sumário (página 1-based)
    tocFactors.push({ label: `Fator: ${label}`, page: ctx.pageIndex + 1, facetas: [] });

    heading(ctx, ensure, `Fator: ${label}`, 24, ctx.theme.PRIMARY);
    if (fb.descricao) paragraph(ctx, ensure, fb.descricao, 11, ctx.theme.MUTED);
    divider(ctx, ensure);

    // --- FACETAS ---
    for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
      const facetaTitulo = String((facetaData as any).titulo ?? facetaNome);
      const desc = String((facetaData as any).descricao ?? "");

      // ✅ adiciona no sumário as características do fator
      tocFactors[tocFactors.length - 1].facetas.push(facetaTitulo);

      const avg = calcularMediaFaceta(formKey, (facetaData as any).perguntas, answers);
      const nivel = nivelPorMedia(avg);

      const map: Record<FeedbackLevel, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };
      const lvl = ctx.theme.LEVEL[nivel];
      const badgeText = `Nível: ${map[nivel]}${avg != null ? ` • Média: ${avg.toFixed(2)}` : ""}`;

      // ✅ garante espaço antes, pra evitar que o ensure interno mude a página
      const hCard = estimateCardHeight(ctx, `Característica: ${facetaTitulo}`, desc);
      ensure(ctx, hCard + 16);

      card(
        ctx,
        ensure,
        `Característica: ${facetaTitulo}`,
        { text: badgeText, fg: lvl.fg, bg: lvl.bg },
        desc,
        true
      );

      const consolidado = (facetaData as any).feedbackConsolidado?.[nivel];
      if (consolidado) {
        subheading(ctx, ensure, String(consolidado.titulo), 12, ctx.theme.TEXT);
        paragraph(ctx, ensure, String(consolidado.definicao ?? ""), 11, ctx.theme.TEXT);

        const section = (t: string) => {
          ensure(ctx, 24);
          ctx.page.drawText(t, {
            x: ctx.margin,
            y: ctx.y - lineHeight(12) + 3,
            size: 12,
            font: ctx.fontBold,
            color: ctx.theme.PRIMARY,
          });
          ctx.y -= lineHeight(12);
          ctx.y -= 2;
        };

        if (consolidado.caracteristicas?.length) {
          section("Características");
          bulletList(ctx, ensure, consolidado.caracteristicas, 11);
        }
        if (consolidado.vantagens?.length) {
          section("Vantagens");
          bulletList(ctx, ensure, consolidado.vantagens, 11);
        }
        if (consolidado.dificuldades?.length) {
          section("Dificuldades");
          bulletList(ctx, ensure, consolidado.dificuldades, 11);
        }
        if (consolidado.estrategias?.length) {
          section("Estratégias de Desenvolvimento");
          bulletList(ctx, ensure, consolidado.estrategias, 11);
        }
        if (consolidado.conclusao) paragraph(ctx, ensure, String(consolidado.conclusao), 11, ctx.theme.TEXT);

        divider(ctx, ensure);
      } else {
        ctx.y -= 6;
      }
    }
  }

  /** ---------------- ENCERRAMENTO ---------------- */
  openContentPage(ctx);
  heading(ctx, ensure, "Mensagem final", 22, ctx.theme.PRIMARY);

  callout(
    ctx,
    ensure,
    "",
    "Esperamos que este relatório tenha proporcionado insights valiosos sobre seu perfil e contribuído para o seu desenvolvimento pessoal e profissional.",
    "info"
  );

  paragraph(
    ctx,
    ensure,
    "Lembre-se: autoconhecimento é uma jornada contínua. Use estas informações como ponto de partida para reflexões, melhorias e fortalecimento de suas habilidades pessoais e profissionais.",
    12,
    ctx.theme.TEXT
  );

  paragraph(ctx, ensure, "Agradecemos por participar do Programa de Autoconhecimento Docente.", 12, ctx.theme.TEXT, true);

  paragraph(ctx, ensure, "Formas de contato para suporte, dúvidas ou sugestões: equipeedusaudecaed@ufsm.br", 12, ctx.theme.TEXT);

  /** ---------------- PREENCHER SUMÁRIO (com características) ---------------- */
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

    const dots = "........................................................................";
    ctx.page.drawText(dots, {
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
        const text = `• ${faceta}`;
        const lines = wrapText(text, ctx.fontRegular, facetaSize, facetaMaxW);

        for (let i = 0; i < lines.length; i++) {
          const ln = lines[i];

          ensure(ctx, lineHeight(facetaSize) + 2);

          ctx.page.drawText(ln, {
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

  /** ---------------- PAGINAÇÃO (rodapé em todas, exceto capa) ---------------- */
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    if (i === ctx.coverIndex) continue;

    const p = pages[i];
    const tmp = { ...ctx };
    setPage(tmp, p, i);
    drawFooter(tmp, i + 1, total);
  }

  const pdfBytes = await pdfDoc.save();
  return new Uint8Array(pdfBytes);
}
