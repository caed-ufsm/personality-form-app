"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

/**
 * Cores institucionais / constantes
 */
const UFSM_BLUE = "#005C8B";
const RED = "#e11d48";
const GREEN = "#16a34a";

/**
 * === CONFIGURAÇÃO ===
 * - PAGE_SIZE: quantas perguntas por "página" (navegação)
 * - QUESTIONS: substitua pelo seu array completo (~96)
 */
const PAGE_SIZE = 12;
const QUESTIONS = [
  "Gosto de trabalhar em equipe.",
  "Prefiro planejamento cuidadoso a improvisar.",
  "Tenho curiosidade por novas tecnologias.",
  "Sou organizado para cumprir prazos.",
  "Costumo assumir riscos quando vejo oportunidade.",
  // adicione até ~96 perguntas aqui
];

const TOTAL = QUESTIONS.length;
const DRAFT_KEY = "caed_personality_draft_v1";

/**
 * Schema Zod usado apenas durante edição (permite 0 = não respondido).
 * Na submissão final validamos estritamente 1..5.
 */
const AnswersSchemaEdit = z.object({
  answers: z.array(z.number().int().min(0).max(5)).length(TOTAL),
});
type AnswersForm = z.infer<typeof AnswersSchemaEdit>;

/* ----------------- UTILITÁRIOS DE COR ----------------- */

/** converte hex -> [r,g,b] */
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/** converte r,g,b -> hex */
function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** interpolação linear */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** gera escala de cores entre startHex e endHex com `steps` passos */
function generateScale(startHex: string, endHex: string, steps: number) {
  const [sr, sg, sb] = hexToRgb(startHex);
  const [er, eg, eb] = hexToRgb(endHex);
  const arr: string[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const r = lerp(sr, er, t);
    const g = lerp(sg, eg, t);
    const b = lerp(sb, eb, t);
    arr.push(rgbToHex(r, g, b));
  }
  return arr;
}

/* ----------------- COMPONENTE PRINCIPAL ----------------- */

export default function Page() {
  // número de "páginas" (para navegação com PAGE_SIZE itens por página)
  const numPages = Math.max(1, Math.ceil(TOTAL / PAGE_SIZE));
  // escala de 5 cores do vermelho ao verde
  const SCALE = useMemo(() => generateScale(RED, GREEN, 5), []);

  /**
   * Carrega rascunho do localStorage (se existir). Isso permite retomar o formulário.
   * Se não existir, inicializamos com array de zeros (não respondido).
   */
  const initialValues: AnswersForm = useMemo(() => {
    try {
      if (typeof window === "undefined") return { answers: Array(TOTAL).fill(0) };
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return { answers: Array(TOTAL).fill(0) };
      const parsed = JSON.parse(raw) as Partial<AnswersForm>;
      if (parsed?.answers && Array.isArray(parsed.answers) && parsed.answers.length === TOTAL) {
        return { answers: parsed.answers };
      }
      return { answers: Array(TOTAL).fill(0) };
    } catch {
      return { answers: Array(TOTAL).fill(0) };
    }
  }, []);

  // inicializa react-hook-form com o schema "leve" de edição
  const methods = useForm<AnswersForm>({
    resolver: zodResolver(AnswersSchemaEdit),
    mode: "onTouched", // mostra erro só após o usuário tocar/submit
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

  // extraímos funções principais do RHF
  const { control, handleSubmit, getValues, watch, setError, formState, reset } = methods;

  // estado do componente
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<null | "idle" | "saving" | "saved" | "error">("idle");
  const [summary, setSummary] = useState<null | AnswersForm>(null);

  // ref para debounce do autosave
  const timerRef = useRef<number | null>(null);
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL);

  /**
   * AUTOSAVE: usamos watch() com subscription para reagir apenas a mudanças nos campos.
   * Isso evita problemas de tipagem com watch([...names]) e é eficiente.
   */
  useEffect(() => {
    const subscription = watch((_, info) => {
      if (!info?.name) return;
      const m = /^answers\.(\d+)$/.exec(String(info.name));
      if (!m) return;
      const idx = Number(m[1]);
      // só salvamos quando a alteração for de um campo da página atual
      if (idx < start || idx >= end) return;

      // debounce simples para não gravar constantemente
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setStatus("saving");
      timerRef.current = window.setTimeout(() => {
        try {
          const data = getValues();
          localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
          setStatus("saved");
          window.setTimeout(() => setStatus("idle"), 700);
        } catch (err) {
          console.error("autosave error", err);
          setStatus("error");
        }
      }, 600);
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch, start, end]);

  /** retorna cor para cada opção da escala (1..5) */
  function colorForOption(opt: number) {
    return SCALE[opt - 1] ?? "#ddd";
  }

  /**
   * Validação estrita da página atual: exige que cada pergunta da página tenha valor 1..5.
   * Se algum campo inválido, seta erro e retorna o índice do primeiro inválido.
   */
  function validatePageStrict() {
    const vals = getValues().answers;
    for (let i = start; i < end; i++) {
      const v = vals[i];
      if (typeof v !== "number" || v < 1 || v > 5) {
        setError(`answers.${i}` as any, { type: "required", message: "Selecione uma opção" });
        return { ok: false, firstIndex: i };
      }
    }
    return { ok: true };
  }

  /** navegar para a próxima página (valida página atual antes) */
  function goNext() {
    const valid = validatePageStrict();
    if (!valid.ok) {
      const idx = valid.firstIndex!;
      const el = document.getElementById(`answers-${idx}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPage((p) => Math.min(numPages - 1, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** navegar para a página anterior */
  function goPrev() {
    setPage((p) => Math.max(0, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * onSubmit: valida estritamente 1..5 para todas as respostas e envia para /api/forms.
   * Se a validação falhar, marcamos erros e rolamos até o primeiro inválido.
   */
  async function onSubmit(values: AnswersForm) {
    setStatus("saving");

    // schema estrito para envio final (1..5)
    const Strict = z.object({
      answers: z.array(z.number().int().min(1).max(5)).length(TOTAL),
    });
    const parsed = Strict.safeParse(values);

    if (!parsed.success) {
      // marca erros por campo, rola para o primeiro inválido e aborta envio
      values.answers.forEach((v, i) => {
        if (typeof v !== "number" || v < 1 || v > 5) {
          setError(`answers.${i}` as any, { type: "required", message: "Selecione uma opção" });
        }
      });
      const firstErr = values.answers.findIndex((v) => typeof v !== "number" || v < 1 || v > 5);
      if (firstErr >= 0) {
        const el = document.getElementById(`answers-${firstErr}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setStatus("error");
      return;
    }

    try {
      // payload enviado: { answers: [...] }
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: parsed.data.answers }),
      });
      if (!res.ok) {
        console.error("server returned error", await res.text().catch(() => null));
        setStatus("error");
        return;
      }
      // limpeza após sucesso
      localStorage.removeItem(DRAFT_KEY);
      setSummary(parsed.data);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1200);
    } catch (err) {
      console.error("submit error", err);
      setStatus("error");
    }
  }

  // contagem de itens respondidos e progresso visual
  const filledCount = getValues().answers.filter(Boolean).length;
  const progress = Math.round((filledCount / TOTAL) * 100);

  /* ----------------- RENDER ----------------- */
  return (
    <FormProvider {...methods}>
      <section id="personality-wizard" className="py-8 px-4 sm:px-6 lg:py-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: UFSM_BLUE }}>
            Teste de personalidade
          </h1>

          {/* Barra de progresso */}
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div className="h-full" style={{ width: `${progress}%`, background: UFSM_BLUE }} />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Progresso: {filledCount}/{TOTAL} — Página {page + 1} de {numPages}
            </div>
          </div>

          {/* Formulário / perguntas (paginado) */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {QUESTIONS.slice(start, end).map((q, idx) => {
              const globalIndex = start + idx; // índice absoluto da pergunta
              const fieldName = `answers.${globalIndex}` as const;

              return (
                <fieldset
                  key={fieldName}
                  id={`answers-${globalIndex}`}
                  className="rounded-md p-3 sm:p-4 border border-gray-100 bg-white shadow-sm"
                  aria-labelledby={`${fieldName}-label`}
                >
                  <legend id={`${fieldName}-label`} className="text-sm font-medium text-gray-800 mb-2">
                    {globalIndex + 1}. {q}
                  </legend>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center gap-3 px-2">
                      {/* Controller garante que o valor enviado é sempre number e evita conflitos de handlers */}
                      <Controller
                        control={control}
                        name={fieldName as any}
                        render={({ field }) => {
                          const selected = Number(field.value ?? 0);
                          return (
                            <>
                              {[1, 2, 3, 4, 5].map((opt) => {
                                const id = `${fieldName}-${opt}`;
                                const isSelected = selected === opt;
                                return (
                                  <label
                                    key={id}
                                    htmlFor={id}
                                    className="flex flex-col items-center cursor-pointer select-none"
                                  >
                                    <input
                                      id={id}
                                      type="radio"
                                      className="sr-only"
                                      value={String(opt)}
                                      checked={isSelected}
                                      onChange={() => {
                                        // chamamos field.onChange com NUMBER (não string)
                                        field.onChange(opt);
                                      }}
                                      aria-checked={isSelected}
                                    />

                                    {/* bolinha estilizada */}
                                    <span
                                      aria-hidden
                                      className={`rounded-full transition-transform duration-150 ease-out`}
                                      title={`${opt} / 5`}
                                      style={{
                                        background: colorForOption(opt),
                                        width: isSelected ? 44 : 36,
                                        height: isSelected ? 44 : 36,
                                        transform: isSelected ? "scale(1.08)" : "scale(1)",
                                        border: isSelected ? "3px solid #000" : "1px solid rgba(0,0,0,0.06)",
                                        boxShadow: isSelected ? "0 8px 18px rgba(0,0,0,0.12)" : "none",
                                        display: "inline-block",
                                      }}
                                    />
                                  </label>
                                );
                              })}
                            </>
                          );
                        }}
                      />
                    </div>

                    {/* rótulos extremos (baixo) */}
                    <div className="w-full px-4">
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Discordo totalmente</span>
                        <span>Concordo totalmente</span>
                      </div>
                    </div>
                  </div>

                  {/* mensagem de erro do campo (aparece se o usuário tentou avançar/submit sem responder) */}
                  {formState.errors?.answers && (formState.errors.answers as any)[globalIndex] && (
                    <p className="text-xs text-red-600 mt-2">
                      {(formState.errors.answers as any)[globalIndex]?.message ?? "Selecione uma opção"}
                    </p>
                  )}
                </fieldset>
              );
            })}

            {/* ações / navegação */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-1">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={page === 0}
                  className="px-3 py-2 rounded border bg-white w-full sm:w-auto text-sm"
                >
                  Anterior
                </button>

                {page < numPages - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="px-3 py-2 rounded bg-indigo-600 text-white w-full sm:w-auto text-sm"
                  >
                    Próxima
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-3 py-2 rounded bg-green-600 text-white w-full sm:w-auto text-sm"
                    disabled={status === "saving"}
                  >
                    Enviar tudo
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const data = getValues();
                      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
                      setStatus("saved");
                      setTimeout(() => setStatus("idle"), 900);
                    } catch {
                      setStatus("error");
                    }
                  }}
                  className="px-3 py-2 rounded border text-sm w-full sm:w-auto"
                >
                  Salvar rascunho
                </button>

                <button
                  type="button"
                  onClick={() => {
                    reset({ answers: Array(TOTAL).fill(0) });
                    localStorage.removeItem(DRAFT_KEY);
                    setSummary(null);
                    setPage(0);
                  }}
                  className="px-3 py-2 rounded border text-sm w-full sm:w-auto"
                >
                  Limpar tudo
                </button>

                <div className="text-xs text-gray-600 ml-2">
                  {status === "saving" ? "Salvando..." : status === "saved" ? "Salvo" : ""}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">Você pode salvar o rascunho e continuar depois.</p>
          </form>

          {/* resumo simples depois do envio bem-sucedido */}
          {summary && (
            <section className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold" style={{ color: UFSM_BLUE }}>
                Resumo das respostas
              </h2>
              <ol className="mt-3 list-decimal list-inside space-y-2 text-sm">
                {QUESTIONS.map((q, i) => {
                  const val = (summary as any).answers[i] as number;
                  return (
                    <li key={i} className="flex items-center justify-between gap-4">
                      <span className="text-gray-800">{q}</span>
                      <span className="ml-4 font-medium">{val} / 5</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      </section>
    </FormProvider>
  );
}
