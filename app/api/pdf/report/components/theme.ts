// app/api/forms/pdf/report/theme.ts
import { rgb } from "pdf-lib";

export const makeTheme = () => {
  const PRIMARY = rgb(0.08, 0.28, 0.58);
  const ACCENT = PRIMARY;

  const TEXT = rgb(0.09, 0.09, 0.1);
  const MUTED = rgb(0.4, 0.4, 0.45);

  const DIVIDER = rgb(0.87, 0.88, 0.9);

  const BG = rgb(0.98, 0.98, 0.99);
  const CARD_BG = rgb(1, 1, 1);

  const DANGER = rgb(0.72, 0.12, 0.12);

  const LEVEL = {
    baixo: { fg: rgb(0.08, 0.28, 0.58), bg: rgb(0.92, 0.96, 1.0) },
    medio: { fg: rgb(0.08, 0.28, 0.58), bg: rgb(0.92, 0.96, 1.0) },
    alto: { fg: rgb(0.08, 0.28, 0.58), bg: rgb(0.92, 0.96, 1.0) },
  } as const;

  return { PRIMARY, ACCENT, TEXT, MUTED, DIVIDER, BG, CARD_BG, DANGER, LEVEL };
};

export type Theme = ReturnType<typeof makeTheme>;
