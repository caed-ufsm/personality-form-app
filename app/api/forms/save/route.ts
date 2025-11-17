import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // garante que NÃO vai rodar em edge

// 🔧 Ativa/desativa debug via variáveis de ambiente
const DEBUG = process.env.DEBUG_MODE === "true";

// Função helper para log
function debugLog(...args: any[]) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}

export async function POST(req: NextRequest) {
  try {
    debugLog("📩 [FORM SAVE] Requisição recebida");

    // 🔍 1) Parse do JSON
    let body: any;
    try {
      body = await req.json();
      debugLog("🧪 Body recebido:", body);
    } catch (e) {
      console.error("❌ [FORM SAVE] Erro ao fazer parse do JSON:", e);
      return NextResponse.json(
        { error: "JSON inválido ou ausente." },
        { status: 400 }
      );
    }

    const { sessionId, results } = body;

    debugLog("🔗 Tentando acessar prisma.userResult.findUnique para sessionId:", sessionId);

    const existing = await prisma.userResult.findUnique({
      where: { sessionId },
    });

    debugLog("🔍 findUnique retornou:", existing ? "ENCONTRADO" : "NÃO encontrado");

    // 🔄 Update ou Create
    if (existing) {
      debugLog("✏️ Atualizando registro existente para sessionId:", sessionId);
      await prisma.userResult.update({
        where: { sessionId },
        data: { results },
      });
    } else {
      debugLog("🆕 Criando novo registro para sessionId:", sessionId);
      await prisma.userResult.create({
        data: { sessionId, results },
      });
    }

    debugLog("🎉 Dados salvos com sucesso!");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("💥 [FORM SAVE] Erro ao salvar resultados:", error);
    return NextResponse.json(
      { error: "Erro ao salvar resultados." },
      { status: 500 }
    );
  }
}
