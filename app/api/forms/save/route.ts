import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { sessionId, results } = await req.json();

        if (!sessionId || !results) {
            return NextResponse.json(
                { error: "Faltam dados obrigatórios." },
                { status: 400 }
            );
        }

        const existing = await prisma.userResult.findUnique({ where: { sessionId } });

        if (existing) {
            await prisma.userResult.update({
                where: { sessionId },
                data: { results },
            });
        } else {
            await prisma.userResult.create({
                data: { sessionId, results },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro ao salvar resultados:", error);
        return NextResponse.json({ error: "Erro ao salvar resultados." }, { status: 500 });
    }
}
