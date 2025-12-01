// app/api/forms/pdf/report/components/blocks.ts
import { rgb } from "pdf-lib";
import type { LayoutCtx } from "./layout";
import { lineHeight, wrapText } from "./layout";

export type EnsureFn = (ctx: LayoutCtx, needed: number) => void;

export function callout(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  title: string,
  text: string,
  variant: "info" | "danger" = "info"
) {
  const pad = 12;
  const titleSize = 12;
  const textSize = 11;

  const fg = variant === "danger" ? ctx.theme.DANGER : ctx.theme.PRIMARY;
  const bg = variant === "danger" ? rgb(1.0, 0.94, 0.94) : rgb(0.93, 0.96, 1.0);

  const contentW = ctx.width - ctx.margin * 2;

  const titleLines = wrapText(title, ctx.fontBold, titleSize, contentW - pad * 2);
  const textLines = wrapText(text, ctx.fontRegular, textSize, contentW - pad * 2);

  const h =
    pad +
    titleLines.length * lineHeight(titleSize) +
    4 +
    textLines.length * lineHeight(textSize) +
    pad;

  ensure(ctx, h + 10);

  const top = ctx.y;
  const y = top - h;

  ctx.page.drawRectangle({
    x: ctx.margin,
    y,
    width: contentW,
    height: h,
    color: bg,
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  });

  ctx.page.drawRectangle({
    x: ctx.margin,
    y,
    width: 5,
    height: h,
    color: fg,
  });

  let yy = top - pad;

  const lhT = lineHeight(titleSize);
  for (const ln of titleLines) {
    ctx.page.drawText(ln, {
      x: ctx.margin + pad + 6,
      y: yy - lhT + 3,
      size: titleSize,
      font: ctx.fontBold,
      color: ctx.theme.TEXT,
    });
    yy -= lhT;
  }

  yy -= 2;

  const lhP = lineHeight(textSize);
  for (const ln of textLines) {
    ctx.page.drawText(ln, {
      x: ctx.margin + pad + 6,
      y: yy - lhP + 3,
      size: textSize,
      font: ctx.fontRegular,
      color: ctx.theme.TEXT,
    });
    yy -= lhP;
  }

  ctx.y = y - 12;
}

export function pill(ctx: LayoutCtx, x: number, y: number, label: string, fg: any, bg: any) {
  const size = 10;
  const padX = 8;
  const padY = 5;

  const textW = ctx.fontBold.widthOfTextAtSize(label, size);
  const w = textW + padX * 2;
  const h = size + padY * 2;

  ctx.page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: bg,
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  });

  ctx.page.drawText(label, {
    x: x + padX,
    y: y + padY,
    size,
    font: ctx.fontBold,
    color: fg,
  });

  return { w, h };
}

/** Estima altura do card (pra pre-ensure no builder) */
export function estimateCardHeight(ctx: LayoutCtx, title: string, desc: string) {
  const pad = 14;
  const w = ctx.width - ctx.margin * 2;
  const innerW = w - pad * 2;

  const titleSize = 14;
  const descSize = 11;

  const titleH = lineHeight(titleSize);
  const descLines = wrapText(desc, ctx.fontRegular, descSize, innerW).slice(0, 6);
  const descH = descLines.length * lineHeight(descSize);

  return Math.max(120, pad + titleH + 12 + descH + pad);
}

/** Card com badge */
export function card(
  ctx: LayoutCtx,
  ensure: EnsureFn,
  title: string,
  badge: { text: string; fg: any; bg: any },
  desc: string,
  preEnsured = false
) {
  const pad = 14;
  const w = ctx.width - ctx.margin * 2;

  const innerW = w - pad * 2;
  const titleSize = 14;
  const descSize = 11;

  const titleH = lineHeight(titleSize);
  const descLines = wrapText(desc, ctx.fontRegular, descSize, innerW).slice(0, 6);
  const descH = descLines.length * lineHeight(descSize);

  const h = Math.max(120, pad + titleH + 12 + descH + pad);

  if (!preEnsured) ensure(ctx, h + 16);

  const top = ctx.y;
  const y = top - h;

  ctx.page.drawRectangle({
    x: ctx.margin,
    y,
    width: w,
    height: h,
    color: ctx.theme.CARD_BG,
    borderColor: rgb(0.86, 0.88, 0.92),
    borderWidth: 1,
  });

  ctx.page.drawRectangle({
    x: ctx.margin,
    y: y + h - 4,
    width: w,
    height: 4,
    color: ctx.theme.ACCENT,
  });

  ctx.page.drawText(title, {
    x: ctx.margin + pad,
    y: top - pad - titleH + 3,
    size: titleSize,
    font: ctx.fontBold,
    color: ctx.theme.TEXT,
  });

  const badgeY = top - pad - 18;
  const badgeX = ctx.margin + w - pad - 170;
  pill(ctx, badgeX, badgeY, badge.text, badge.fg, badge.bg);

  let yy = top - pad - 30;
  const lh = lineHeight(descSize);

  for (const ln of descLines) {
    ctx.page.drawText(ln, {
      x: ctx.margin + pad,
      y: yy - lh + 3,
      size: descSize,
      font: ctx.fontRegular,
      color: ctx.theme.MUTED,
    });
    yy -= lh;
  }

  ctx.y = y - 12;
}
