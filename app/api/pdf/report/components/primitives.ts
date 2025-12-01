// app/api/forms/pdf/report/components/primitives.ts
import type { LayoutCtx } from "./layout";
import { lineHeight, wrapText } from "./layout";

export type EnsureFn = (ctx: LayoutCtx, needed: number) => void;

/** Linha divisória */
export function divider(ctx: LayoutCtx, ensure: EnsureFn, gapTop = 10, gapBottom = 14) {
  ensure(ctx, gapTop + gapBottom + 2);

  ctx.y -= gapTop;
  ctx.page.drawLine({
    start: { x: ctx.margin, y: ctx.y },
    end: { x: ctx.width - ctx.margin, y: ctx.y },
    thickness: 1,
    color: ctx.theme.DIVIDER,
  });
  ctx.y -= gapBottom;
}

/** Parágrafo com quebra automática */
export function paragraph(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  text: string,
  size = 11,
  color: any = ctx.theme.TEXT,
  bold = false
) {
  const font = bold ? ctx.fontBold : ctx.fontRegular;
  const maxW = ctx.width - ctx.margin * 2;

  const lh = lineHeight(size);
  const lines = wrapText(text, font, size, maxW);

  ensure(ctx, lh * lines.length + 6);

  for (const ln of lines) {
    ctx.page.drawText(ln, {
      x: ctx.margin,
      y: ctx.y - lh + 3,
      size,
      font,
      color,
    });
    ctx.y -= lh;
  }

  ctx.y -= 6;
}

/** Título principal */
export function heading(ctx: LayoutCtx, ensure: EnsureFn, text: string, size = 22, color?: any) {
  const lh = lineHeight(size);
  ensure(ctx, lh + 14);

  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y - lh + 3,
    size,
    font: ctx.fontBold,
    color: color ?? ctx.theme.TEXT,
  });

  ctx.y -= lh;
  ctx.y -= 6;
}

/** Subtítulo */
export function subheading(ctx: LayoutCtx, ensure: EnsureFn, text: string, size = 14, color?: any) {
  const lh = lineHeight(size);
  ensure(ctx, lh + 6);

  ctx.page.drawText(text, {
    x: ctx.margin,
    y: ctx.y - lh + 3,
    size,
    font: ctx.fontBold,
    color: color ?? ctx.theme.TEXT,
  });

  ctx.y -= lh;
  ctx.y -= 4;
}

/** Lista com bullets + quebra em múltiplas linhas */
export function bulletList(ctx: LayoutCtx, ensure: EnsureFn, items: string[], size = 11) {
  const maxW = ctx.width - ctx.margin * 2 - 18;
  const lh = lineHeight(size);

  for (const item of items) {
    const lines = wrapText(item, ctx.fontRegular, size, maxW);
    ensure(ctx, lh * lines.length + 6);

    // bolinha
    ctx.page.drawCircle({
      x: ctx.margin + 4,
      y: ctx.y - lh / 2 + 3,
      size: 1.6,
      color: ctx.theme.ACCENT,
    });

    // primeira linha do item
    ctx.page.drawText(lines[0] ?? "", {
      x: ctx.margin + 18,
      y: ctx.y - lh + 3,
      size,
      font: ctx.fontRegular,
      color: ctx.theme.TEXT,
    });
    ctx.y -= lh;

    // continuação (quebras)
    for (const extra of lines.slice(1)) {
      ctx.page.drawText(extra, {
        x: ctx.margin + 18,
        y: ctx.y - lh + 3,
        size,
        font: ctx.fontRegular,
        color: ctx.theme.TEXT,
      });
      ctx.y -= lh;
    }

    ctx.y -= 2;
  }

  ctx.y -= 6;
}
