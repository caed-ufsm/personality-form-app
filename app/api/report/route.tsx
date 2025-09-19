// app/api/report/route.ts
import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import PDFReport, { Answer, Group } from '../../pdf/PDFReport';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      respondent,
      groups,
      answers,
      footerNote,
      themeColor,
      logo,
      scaleMin,
      scaleMax,
      scaleColors,
      defaultItemText,
      defaultOverviewText,
    } = body as {
      title?: string;
      respondent?: { name?: string; email?: string };
      groups?: Group[];         // opcional
      answers?: Answer[];       // opcional (fallback)
      footerNote?: string;
      themeColor?: string;
      logo?: { src: string; width?: number; height?: number; alt?: string };
      scaleMin?: number;
      scaleMax?: number;
      scaleColors?: string[];
      defaultItemText?: string;
      defaultOverviewText?: string;
    };

    const nodeBuffer = await renderToBuffer(
      PDFReport({
        title,
        respondent,
        groups,           // pode ser undefined
        answers,          // fallback
        footerNote,
        themeColor,
        logo,
        scaleMin,
        scaleMax,
        scaleColors,
        defaultItemText,
        defaultOverviewText,
      })
    );

    const bytes = new Uint8Array(nodeBuffer);
    const filename = `${(title || 'relatorio').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
        'Content-Length': String(bytes.byteLength),
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro ao gerar PDF' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
