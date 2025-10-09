import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import rawExtroversao from "@/lib/feedbacks/extroversao.json";
import rawNeuroticismo from "@/lib/feedbacks/neuroticismo.json";

/** ---------------- Tipos ---------------- */
export type FeedbackLevel = "baixo" | "medio" | "alto";

type PerguntaFeedback = {
  id: string;
  texto: string;
  feedbacks: Record<FeedbackLevel, string>;
};
type FeedbackConsolidado = {
  titulo: string; definicao: string;
  caracteristicas: string[]; vantagens: string[];
  dificuldades: string[]; estrategias: string[]; conclusao: string;
};
type Faceta = { descricao: string; perguntas: PerguntaFeedback[]; feedbackConsolidado: Record<FeedbackLevel, FeedbackConsolidado> };
type FeedbackForm = { facetas: Record<string, Faceta> };
export type OneForm = { id: string; answers: Record<string, number | string> };
type FormKey = "extroversao" | "neuroticismo";

/** ---------------- Dados ---------------- */
const FEEDBACKS: Record<FormKey, FeedbackForm> = {
  extroversao: (rawExtroversao as any).Extroversao,
  neuroticismo: (rawNeuroticismo as any).Neuroticismo,
};

/** ---------------- Utils / Resolvers ---------------- */
const REVERSE_TAG = /^\s*\[R\]\s*/i;

function resolveFormKey(formId: string): FormKey | undefined {
  const f = formId.trim().toLowerCase();
  if (f.includes("neuro")) return "neuroticismo";
  if (f.includes("extrover")) return "extroversao";
  if ((["extroversao","neuroticismo"] as const).includes(f as any)) return f as FormKey;
  return undefined;
}

type IdResolver = (jsonId: string) => string | null;
const neuroticismoResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id); if (!m) return null;
  const prefix = m[1].toUpperCase(), num = +m[2];
  const offs: Record<string, number> = { N:0,H:6,D:12,AC:18,I:24 };
  const off = offs[prefix]; if (off===undefined || !num) return null;
  return `n${off+num}`;
};
const extroversaoResolver: IdResolver = (id) => {
  const m = /^([A-Z]+)(\d+)$/i.exec(id); if (!m) return null;
  const prefix = m[1].toUpperCase(), num = +m[2];
  const offs: Record<string, number> = { A:0, AS:6, EP:12 };
  const off = offs[prefix]; if (off===undefined || !num) return null;
  return `e${off+num}`;
};
const ID_RESOLVERS: Record<FormKey, IdResolver> = {
  neuroticismo: neuroticismoResolver,
  extroversao: extroversaoResolver,
};

function toNumber(v:any): number|undefined {
  if (typeof v==="number" && Number.isFinite(v)) return v;
  if (typeof v==="string" && v.trim()!=="" && !isNaN(Number(v))) return Number(v);
  return undefined;
}

function getAnswerFor(
  formKey: FormKey,
  pergunta: { id: string; texto: string },
  answers: Record<string, any>
): number|undefined {
  if (pergunta.id in answers) {
    const v = toNumber(answers[pergunta.id]); if (v!==undefined) return v;
  }
  const mapped = ID_RESOLVERS[formKey](pergunta.id);
  if (mapped && mapped in answers) {
    const v = toNumber(answers[mapped]); if (v!==undefined) return v;
  }
  const lower = new Map<string,string>(Object.keys(answers).map(k=>[k.toLowerCase(),k]));
  for (const k of [pergunta.id, mapped].filter(Boolean) as string[]) {
    const real = lower.get(k.toLowerCase());
    if (real) { const v = toNumber(answers[real]); if (v!==undefined) return v; }
  }
  return undefined;
}

const stripReverseTag = (s:string)=> String(s||"").replace(REVERSE_TAG,"");
const reverseLikert1to5 = (v:number)=> 6-v;

function calcularMediaFaceta(formKey: FormKey, perguntas: PerguntaFeedback[], answers: Record<string,any>): number|null {
  const vals:number[] = [];
  for (const p of perguntas) {
    const raw = getAnswerFor(formKey,p,answers);
    if (typeof raw!=="number") continue;
    vals.push(REVERSE_TAG.test(p.texto) ? reverseLikert1to5(raw) : raw);
  }
  if (!vals.length) return null;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function nivelPorMedia(media:number|null): FeedbackLevel {
  if (media==null) return "medio";
  if (media<=2) return "baixo"; if (media>=4) return "alto"; return "medio";
}

/** ---------------- Layout helpers ---------------- */
type LayoutCtx = {
  pdfDoc: PDFDocument; page:any; width:number; height:number; x:number; y:number; margin:number; fontRegular:any; fontBold:any;
};

function newLayout(pdfDoc: PDFDocument, fontRegular:any, fontBold:any): LayoutCtx {
  const page = pdfDoc.addPage(); const {width,height} = page.getSize(); const margin = 56;
  return { pdfDoc, page, width, height, x: margin, y: height-margin, margin, fontRegular, fontBold };
}
function setPage(ctx:LayoutCtx, page:any){ ctx.page=page; const {width,height}=page.getSize(); ctx.width=width; ctx.height=height; ctx.x=ctx.margin; ctx.y=ctx.height-ctx.margin; }
function newPage(ctx:LayoutCtx){ const p=ctx.pdfDoc.addPage(); setPage(ctx,p); }
const lineHeight=(s:number)=> s*1.35;
function ensure(ctx:LayoutCtx, needed:number){ if (ctx.y-needed < ctx.margin) newPage(ctx); }
function wrapText(text:string, font:any, size:number, maxWidth:number){
  const words=String(text||"").split(/\s+/); const lines:string[]=[]; let line="";
  for(const w of words){ const test=line?`${line} ${w}`:w; if(font.widthOfTextAtSize(test,size)>maxWidth && line){lines.push(line); line=w;} else line=test;}
  if(line) lines.push(line); return lines;
}
function paragraph(ctx:LayoutCtx,text:string,size=11,color=rgb(0,0,0),bold=false){
  const font=bold?ctx.fontBold:ctx.fontRegular; const maxW=ctx.width-ctx.margin*2; const lh=lineHeight(size); const lines=wrapText(text,font,size,maxW);
  ensure(ctx, lh*lines.length); for(const ln of lines){ ctx.page.drawText(ln,{x:ctx.x,y:ctx.y-lh+3,size,font,color}); ctx.y-=lh; } ctx.y-=size*0.25;
}
function heading(ctx:LayoutCtx,text:string,size=20,color=rgb(0.08,0.28,0.58)){
  const lh=lineHeight(size); ensure(ctx,lh+8);
  ctx.page.drawText(text,{x:ctx.x,y:ctx.y-lh+3,size,font:ctx.fontBold,color}); ctx.y-=lh;
  ctx.page.drawLine({start:{x:ctx.x,y:ctx.y-6}, end:{x:ctx.width-ctx.margin,y:ctx.y-6}, thickness:2, color}); ctx.y-=14;
}
function subheading(ctx:LayoutCtx,text:string,size=14,color=rgb(0.08,0.08,0.08)){ const lh=lineHeight(size); ensure(ctx,lh); ctx.page.drawText(text,{x:ctx.x,y:ctx.y-lh+3,size,font:ctx.fontBold,color}); ctx.y-=lh; }
function bulletList(ctx:LayoutCtx,items:string[],size=11,bulletColor=rgb(0.08,0.28,0.58)){
  const maxW=ctx.width-ctx.margin*2-16; const lh=lineHeight(size);
  for(const item of items){ const lines=wrapText(item,ctx.fontRegular,size,maxW); ensure(ctx,lh*lines.length);
    ctx.page.drawCircle({x:ctx.x+2,y:ctx.y-lh/2+3,size:1.5,color:bulletColor});
    ctx.page.drawText(lines[0],{x:ctx.x+16,y:ctx.y-lh+3,size,font:ctx.fontRegular}); ctx.y-=lh;
    for(const extra of lines.slice(1)){ ctx.page.drawText(extra,{x:ctx.x+16,y:ctx.y-lh+3,size,font:ctx.fontRegular}); ctx.y-=lh; }
  }
  ctx.y-=size*0.25;
}

/** mini-gauge perfeitamente alinhado ao título da faceta */
function drawFacetMiniGaugeAt(ctx: LayoutCtx, avg: number | null, titleTopY: number, ACCENT:any, LIGHT:any) {
  const w=80, h=8, x=ctx.width-ctx.margin-w, y=titleTopY+2;           // mesmo baseline do título
  ctx.page.drawRectangle({ x, y, width:w, height:h, color: LIGHT });
  if (avg!=null) {
    const frac=Math.max(0,Math.min(1,(avg-1)/4));
    ctx.page.drawRectangle({ x, y, width: Math.max(2,w*frac), height:h, color: ACCENT, opacity:0.9 });
  }
}

/** gráfico de barras horizontal (1–5) */
function drawSummaryChart(ctx: LayoutCtx, rows: {label:string; avg:number|null}[], palette:{PRIMARY:any; ACCENT:any; GRID:any; TEXT:any}) {
  const { ACCENT, GRID, TEXT } = palette;
  const titleH = 18;
  const chartLeft = ctx.x;
  const chartTop = ctx.y - titleH - 10;
  const labelColW = 130;
  const axisW = ctx.width - ctx.margin - chartLeft - 10;
  const barW = axisW - labelColW;
  const rowH = 18;
  const innerPad = 6;

  // faixa de título
  ctx.page.drawRectangle({ x: chartLeft, y: ctx.y - titleH, width: axisW, height: titleH, color: ACCENT, opacity: 0.9 });
  ctx.page.drawText("Resumo por faceta (média 1–5)", {
    x: chartLeft + 8, y: ctx.y - titleH + 4, size: 11, color: rgb(1,1,1), font: ctx.fontBold
  });

  // grade vertical (ticks 1..5)
  for (let t=1;t<=5;t++){
    const x = chartLeft + labelColW + (barW * ((t-1)/4));
    ctx.page.drawLine({ start:{x, y: chartTop - rowH*rows.length - innerPad}, end:{x, y: chartTop - 4}, color: GRID, thickness: 0.5 });
    ctx.page.drawText(String(t), { x: x-3, y: chartTop - rowH*rows.length - innerPad - 12, size: 9, font: ctx.fontRegular, color: TEXT });
  }

  // linhas/barras
  let y = chartTop - 4;
  for (const r of rows) {
    // label
    ctx.page.drawText(r.label, { x: chartLeft, y: y - rowH + 4, size: 11, font: ctx.fontRegular, color: TEXT });
    // fundo da barra
    ctx.page.drawRectangle({ x: chartLeft + labelColW, y: y - rowH + 6, width: barW, height: rowH-8, color: GRID, opacity: 0.4 });
    // valor
    if (r.avg != null) {
      const frac = Math.max(0, Math.min(1, (r.avg - 1) / 4));
      ctx.page.drawRectangle({ x: chartLeft + labelColW, y: y - rowH + 6, width: Math.max(2, barW * frac), height: rowH-8, color: ACCENT });
      ctx.page.drawText(r.avg.toFixed(2), { x: chartLeft + labelColW + barW + 6, y: y - rowH + 4, size: 11, font: ctx.fontBold, color: TEXT });
    } else {
      ctx.page.drawText("—", { x: chartLeft + labelColW + barW + 6, y: y - rowH + 4, size: 11, font: ctx.fontRegular, color: TEXT });
    }
    y -= rowH;
  }

  // ajusta y do contexto abaixo do gráfico
  ctx.y = chartTop - rowH*rows.length - innerPad - 20;
}

/** ---------------- Builder ---------------- */
export async function buildPdfReport(forms: OneForm[], opts?: { title?: string }): Promise<Uint8Array> {
  const PRIMARY = rgb(0.08, 0.28, 0.58);
  const ACCENT  = rgb(0.15, 0.62, 0.45);
  const LIGHT   = rgb(0.85, 0.85, 0.85);
  const GRID    = rgb(0.85, 0.85, 0.85);
  const TEXT    = rgb(0.15, 0.15, 0.15);
  const TEXT_MUTED = rgb(0.35, 0.35, 0.35);

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const ctx = newLayout(pdfDoc, fontRegular, fontBold);

  // CAPA
  ctx.page.drawRectangle({ x: 0, y: ctx.height - 40, width: ctx.width, height: 40, color: PRIMARY });
  ctx.page.drawText("Relatório do Formulário", { x: ctx.margin, y: ctx.height - 30, size: 12, color: rgb(1,1,1), font: fontBold });

  ctx.y = ctx.height - ctx.margin - 40;
  heading(ctx, opts?.title ?? "Relatório consolidado", 22, PRIMARY);
  paragraph(ctx, "Este relatório apresenta o nível consolidado por faceta e o detalhamento das respostas por afirmação. Escala: 1 (Discordo totalmente) — 5 (Concordo totalmente).", 12, TEXT_MUTED);

  // *** Sem página de sumário ***

  // Páginas de conteúdo
  const openContentPage = () => { const p = pdfDoc.addPage(); setPage(ctx, p); };
  openContentPage();

  for (let i=0;i<forms.length;i++){
    const { id: formIdRaw, answers } = forms[i];
    const formKey = resolveFormKey(formIdRaw);
    const label = formKey ? formKey.charAt(0).toUpperCase() + formKey.slice(1) : String(formIdRaw);

    if (i>0) openContentPage();

    heading(ctx, `Formulário: ${label}`, 22, PRIMARY);

    if (!formKey) {
      paragraph(ctx, "Feedback não encontrado para este formulário.", 12, TEXT_MUTED);
      continue;
    }

    const fb = FEEDBACKS[formKey];

    // --- gráfico de barras (resumo por faceta) ---
    const chartRows = Object.entries(fb.facetas).map(([nome, faceta]) => ({
      label: nome,
      avg: calcularMediaFaceta(formKey, faceta.perguntas, answers),
    }));
    drawSummaryChart(ctx, chartRows, { PRIMARY, ACCENT, GRID, TEXT });

    // --- bullets de resumo (com médias) ---
    const resumo: string[] = [];
    for (const [nome, faceta] of Object.entries(fb.facetas)) {
      const avg = calcularMediaFaceta(formKey, faceta.perguntas, answers);
      const nivel = nivelPorMedia(avg);
      const map: Record<FeedbackLevel,string> = { baixo:"Baixo", medio:"Médio", alto:"Alto" };
      resumo.push(`${nome}: ${map[nivel]}${avg!=null ? ` (média: ${avg.toFixed(2)})` : ""}`);
    }
    bulletList(ctx, resumo, 12, PRIMARY);

    // --- Facetas detalhadas ---
    for (const [facetaNome, facetaData] of Object.entries(fb.facetas)) {
      const titleSize=16, lhTitle=lineHeight(titleSize), titleTopY = ctx.y - lhTitle + 3;

      // faixa + mini gauge alinhados ao título
      ctx.page.drawRectangle({ x: ctx.margin - 8, y: titleTopY - 2, width: 6, height: lhTitle - 2, color: ACCENT });
      const avg = calcularMediaFaceta(formKey, facetaData.perguntas, answers);
      drawFacetMiniGaugeAt(ctx, avg, titleTopY, ACCENT, LIGHT);

      subheading(ctx, `Faceta: ${facetaNome}`, titleSize, PRIMARY);
      paragraph(ctx, facetaData.descricao, 12, TEXT_MUTED);

      const consolidado = facetaData.feedbackConsolidado[nivelPorMedia(avg)];
      if (consolidado) {
        subheading(ctx, consolidado.titulo, 13, rgb(0,0,0));
        paragraph(ctx, consolidado.definicao, 11);
      }

      subheading(ctx, "Respostas desta faceta", 13, rgb(0,0,0));
      for (const pergunta of facetaData.perguntas) {
        const resposta = getAnswerFor(formKey, pergunta, answers);
        if (typeof resposta !== "number") continue;

        const faixa: FeedbackLevel = resposta <= 2 ? "baixo" : resposta >= 4 ? "alto" : "medio";
        const fbPerg = pergunta.feedbacks[faixa];

        paragraph(ctx, stripReverseTag(pergunta.texto), 11, rgb(0,0,0), true);
        paragraph(ctx, `Resposta: ${String(resposta)} (faixa: ${faixa})`, 11, rgb(0.12,0.12,0.12));
        paragraph(ctx, `Feedback: ${fbPerg}`, 11);
        ctx.y -= 6;
      }
      ctx.y -= 8;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const out = new Uint8Array(pdfBytes.length); out.set(pdfBytes);
  return out;
}
