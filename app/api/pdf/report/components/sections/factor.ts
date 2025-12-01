// components/sections/factor.ts
import type { LayoutCtx } from "../layout";
import type { EnsureFn } from "../primitives";
import type { OneForm, FeedbackLevel } from "../data";
import type { TocFactorEntry } from "../data.ts";
import { FEEDBACKS, resolveFormKey } from "../data";
import { calcularMediaFaceta, nivelPorMedia } from "../scoring";
import { heading, paragraph, subheading, bulletList, divider } from "../primitives";
import { card, estimateCardHeight } from "../blocks";
import { lineHeight } from "../layout";

export function renderFactors(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  forms: OneForm[],
  tocFactors: TocFactorEntry[],
  openContentPage: (ctx: LayoutCtx) => void
) {
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

    tocFactors.push({ label: `Fator: ${label}`, page: ctx.pageIndex + 1, facetas: [] });

    heading(ctx, ensure, `Fator: ${label}`, 24, ctx.theme.PRIMARY);
    if (fb.descricao) paragraph(ctx, ensure, fb.descricao, 11, ctx.theme.MUTED);
    divider(ctx, ensure);

    for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
      const facetaTitulo = String((facetaData as any).titulo ?? facetaNome);
      const desc = String((facetaData as any).descricao ?? "");

      tocFactors[tocFactors.length - 1].facetas.push(facetaTitulo);

      const avg = calcularMediaFaceta(formKey, (facetaData as any).perguntas, answers);
      const nivel = nivelPorMedia(avg);

      const map: Record<FeedbackLevel, string> = { baixo: "Baixo", medio: "Médio", alto: "Alto" };
      const lvl = ctx.theme.LEVEL[nivel];
      const badgeText = `Nível: ${map[nivel]}${avg != null ? ` • Média: ${avg.toFixed(2)}` : ""}`;

      const hCard = estimateCardHeight(ctx, `Característica: ${facetaTitulo}`, desc);
      ensure(ctx, hCard + 16);

      card(ctx, ensure, `Característica: ${facetaTitulo}`, { text: badgeText, fg: lvl.fg, bg: lvl.bg }, desc, true);

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

        if (consolidado.caracteristicas?.length) { section("Características"); bulletList(ctx, ensure, consolidado.caracteristicas, 11); }
        if (consolidado.vantagens?.length) { section("Vantagens"); bulletList(ctx, ensure, consolidado.vantagens, 11); }
        if (consolidado.dificuldades?.length) { section("Dificuldades"); bulletList(ctx, ensure, consolidado.dificuldades, 11); }
        if (consolidado.estrategias?.length) { section("Estratégias de Desenvolvimento"); bulletList(ctx, ensure, consolidado.estrategias, 11); }
        if (consolidado.conclusao) paragraph(ctx, ensure, String(consolidado.conclusao), 11, ctx.theme.TEXT);

        divider(ctx, ensure);
      } else {
        ctx.y -= 6;
      }
    }
  }
}
