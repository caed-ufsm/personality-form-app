import { NextResponse } from "next/server";
import { z } from "zod";

const TOTAL = 12; // ajuste para 96 quando precisar

// Schema para formato q1..qN
const QSchema = z.object(
  Object.fromEntries(Array.from({ length: TOTAL }, (_, i) => [`q${i + 1}`, z.number().int().min(1).max(5)]))
);

// Schema para formato answers: [1,2,3,4,5]
const AnswersSchema = z.object({
  answers: z.array(z.number().int().min(1).max(5)).length(TOTAL),
});

// Função util para transformar erros zod em mapa legível
function zodErrorsToMap(err: z.ZodError) {
  const flat = err.flatten();
  // flat.fieldErrors é um Record<string, string[]>
  return flat.fieldErrors;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // log raw body (útil para debugging)
    console.log("[/api/forms] body received:", JSON.stringify(body));

    // 1) tenta o esquema q1..qN
    const tryQ = QSchema.safeParse(body);
    if (tryQ.success) {
      const data = tryQ.data;
      console.log("[/api/forms] parsed as q1..qN:", data);
      // aqui: salvar data no DB, etc.
      return NextResponse.json({ ok: true, message: "Formulário recebido (q1..qN)", data }, { status: 200 });
    }

    // 2) tenta o esquema answers: []
    const tryA = AnswersSchema.safeParse(body);
    if (tryA.success) {
      const answers = tryA.data.answers;
      // converte para q1..qN se quiser (ex.: q1 = answers[0])
      const mapped: Record<string, number> = {};
      answers.forEach((v, i) => {
        mapped[`q${i + 1}`] = v;
      });
      console.log("[/api/forms] parsed as answers[] -> mapped:", mapped);
      // aqui: salvar mapped no DB, etc.
      return NextResponse.json({ ok: true, message: "Formulário recebido (answers[])", data: mapped }, { status: 200 });
    }

    // Se nenhum dos dois passou, retorna erros legíveis para ambos
    const errors: Record<string, any> = {};
    errors.qFormat = zodErrorsToMap(tryQ.error);
    errors.answersFormat = zodErrorsToMap(tryA.error);

    return NextResponse.json(
      { ok: false, message: "Validação falhou", errors },
      { status: 422 }
    );
  } catch (err) {
    console.error("Erro no endpoint /api/forms:", err);
    return NextResponse.json({ ok: false, message: "Erro interno" }, { status: 500 });
  }
}
