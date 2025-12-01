// components/pagination.ts
import type { PDFDocument } from "pdf-lib";
import type { LayoutCtx } from "./layout";
import { setPage } from "./layout";
import { drawFooter } from "./header-footer";

export function applyPageNumbers(pdfDoc: PDFDocument, ctx: LayoutCtx) {
  const pages = pdfDoc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    if (i === ctx.coverIndex) continue;
    const p = pages[i];
    const tmp = { ...ctx };
    setPage(tmp, p as any, i);
    drawFooter(tmp, i + 1, total);
  }
}
