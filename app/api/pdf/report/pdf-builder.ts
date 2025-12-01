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

export async function buildPdfReport(
  forms: OneForm[],
  opts?: { title?: string }
): Promise<Uint8Array> {
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

    heading(ctx, ensure, `Fator: ${label}`, 28, ctx.theme.PRIMARY);
    if (fb.descricao) paragraph(ctx, ensure, fb.descricao, 11, ctx.theme.MUTED);
    divider(ctx, ensure);

    // --- FACETAS ---
    for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
      const facetaTitulo = String((facetaData as any).titulo ?? facetaNome);
      const desc = String((facetaData as any).descricao ?? "");

      const avg = calcularMediaFaceta(formKey, (facetaData as any).perguntas, answers);
      const nivel = nivelPorMedia(avg);

      const map: Record<FeedbackLevel, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };
      const lvl = ctx.theme.LEVEL[nivel];
      const badgeText = `Nível: ${map[nivel]}${avg != null ? ` • Média: ${avg.toFixed(2)}` : ""}`;

      // ✅ garante espaço antes, pra evitar que o ensure interno mude a página
      const hCard = estimateCardHeight(ctx, `Característica: ${facetaTitulo}`, desc);
      ensure(ctx, hCard + 16);

      // ✅ registra a página da faceta (depois do ensure pra pegar a página correta)
      tocFactors[tocFactors.length - 1].facetas.push({
        label: facetaTitulo,
        page: ctx.pageIndex + 1,
      });

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
        if (consolidado.conclusao) {
          paragraph(ctx, ensure, String(consolidado.conclusao), 11, ctx.theme.TEXT);
        }

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

  paragraph(
    ctx,
    ensure,
    "Agradecemos por participar do Programa de Autoconhecimento Docente.",
    12,
    ctx.theme.TEXT,
    true
  );

  paragraph(
    ctx,
    ensure,
    "Formas de contato para suporte, dúvidas ou sugestões: equipeedusaudecaed@ufsm.br",
    12,
    ctx.theme.TEXT
  );

  /** ---------------- PREENCHER SUMÁRIO (com características + páginas) ---------------- */
  setPage(ctx, tocPage, 1);
  drawHeader(ctx);
  heading(ctx, ensure, "Sumário", 22, ctx.theme.TEXT);
  divider(ctx, ensure);

  ctx.y = tocStartY;

  // estilos
  const factorSize = 12;
  const factorRowH = 18;

  const facetaSize = 11;
  const facetaIndent = 18;     // recuo do bloco de facetas
  const bulletX = ctx.margin + facetaIndent + 5;
  const textX = bulletX + 12;  // onde começa o texto da faceta
  const rightPad = 10;

  for (const it of tocFactors) {
    // ---------- LINHA DO FATOR (mais forte) ----------
    ensure(ctx, factorRowH + 10);

    const left = it.label;
    const right = String(it.page);

    const yFactor = ctx.y - lineHeight(factorSize) + 3;

    // mini-barra de destaque à esquerda
    ctx.page.drawRectangle({
      x: ctx.margin - 8,
      y: yFactor - 2,
      width: 3,
      height: lineHeight(factorSize) - 1,
      color: ctx.theme.ACCENT,
    });

    // texto do fator
    ctx.page.drawText(left, {
      x: ctx.margin,
      y: yFactor,
      size: factorSize,
      font: ctx.fontBold,
      color: ctx.theme.TEXT,
    });

    // página à direita
    const rightWFactor = ctx.fontBold.widthOfTextAtSize(right, factorSize);
    const xRightFactor = ctx.width - ctx.margin - rightWFactor;

    // leader dots dinâmico
    const leftWFactor = ctx.fontBold.widthOfTextAtSize(left, factorSize);
    const dotsStart = ctx.margin + leftWFactor + 10;
    const dotsEnd = xRightFactor - 8;

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
      x: xRightFactor,
      y: yFactor,
      size: factorSize,
      font: ctx.fontBold,
      color: ctx.theme.MUTED,
    });

    ctx.y -= factorRowH;
    ctx.y -= 6;

    // ---------- FACETAS ----------
    if (it.facetas?.length) {
      for (const f of it.facetas) {
        const rightText = String(f.page);
        const rightW = ctx.fontBold.widthOfTextAtSize(rightText, facetaSize);
        const xRight = ctx.width - ctx.margin - rightW;

        // largura útil do texto (não invadir o número)
        const textMaxW = Math.max(80, (xRight - rightPad) - textX);

        // wrap sem "•" (a bolinha é desenhada)
        const lines = wrapText(String(f.label), ctx.fontRegular, facetaSize, textMaxW);

        for (let i = 0; i < lines.length; i++) {
          ensure(ctx, lineHeight(facetaSize) + 2);

          const y = ctx.y - lineHeight(facetaSize) + 3;

          // bolinha só na primeira linha
          if (i === 0) {
            ctx.page.drawCircle({
              x: bulletX,
              y: y + facetaSize * 0.36, // ajuste fino p/ alinhar com baseline
              size: 1.4,
              color: ctx.theme.ACCENT,
            });
          }

          // texto (linhas seguintes com recuo sutil)
          ctx.page.drawText(lines[i] ?? "", {
            x: textX + (i === 0 ? 0 : 10),
            y,
            size: facetaSize,
            font: ctx.fontRegular,
            color: ctx.theme.MUTED,
          });

          // leader + número só na primeira linha
          if (i === 0) {
            const firstLine = lines[0] ?? "";
            const firstW = ctx.fontRegular.widthOfTextAtSize(firstLine, facetaSize);

            const leaderStart = textX + firstW + 8;
            const leaderEnd = xRight - 8;

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

            ctx.page.drawText(rightText, {
              x: xRight,
              y,
              size: facetaSize,
              font: ctx.fontBold,
              color: ctx.theme.MUTED,
            });
          }

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
