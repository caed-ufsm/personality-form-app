"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { FormDefinition } from "../lib/types";
import { FormProvider } from "react-hook-form";
import { useFormEngine } from "../hook/useFormEngine";
import ProgressBar from "../../../components/forms/progressbar";
import CategoryNav from "../../../components/forms/categorynav";
import QuestionItem from "../../../components/forms/questionitem";
import PagerActions from "../../../components/forms/pageractions";
import { generateScale } from "../lib/color";
import { RED, GREEN, UFSM_BLUE } from "../lib/theme";

// 🔹 Importa os JSONs de feedbacks
import neuroticismoData from "../../../lib/feedbacks/neuroticismo.json";
import extroversaoData from "../../../lib/feedbacks/extroversao.json";
import conscienciaData from "../../../lib/feedbacks/conscienciosidade.json";
import amabilidadeData from "../../../lib/feedbacks/amabilidade.json";
import aberturaData from "../../../lib/feedbacks/aberturarexp.json";

// ✅ Debug mode (Client Component precisa ser NEXT_PUBLIC_*)
const DEBUG =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

const debugLog = (...args: any[]) => {
  if (!DEBUG) return;
  console.log("%c[DEBUG FEEDBACK]", "color:#0ea5e9;font-weight:bold", ...args);
};

// ✅ pega o JSON pelo formId (estável)
const feedbackByFormId: Record<string, any> = {
  neuroticismo: neuroticismoData,
  extroversao: extroversaoData,
  conscienciosidade: conscienciaData,
  amabilidade: amabilidadeData,
  aberturaexperiencia: aberturaData,
};

// ✅ chave interna quando o JSON vem embrulhado {Chave: {facetas...}}
const factorKeyByFormId: Record<string, string> = {
  neuroticismo: "Neuroticismo",
  extroversao: "Extroversão",
  conscienciosidade: "Conscienciosidade",
  amabilidade: "Amabilidade",
  aberturaexperiencia: "AberturaExperiencia",
};

// 🔹 Ordem dos formulários — personalize aqui
const FORM_ORDER = [
  "neuroticismo",
  "extroversao",
  "amabilidade",
  "conscienciosidade",
  "aberturaexperiencia",
];

// 🔹 Função auxiliar: encontra o próximo formulário
function getNextFormId(currentId: string): string | null {
  const idx = FORM_ORDER.indexOf(currentId);

  if (idx !== -1 && idx < FORM_ORDER.length - 1) {
    return FORM_ORDER[idx + 1];
  }

  return null; // sempre null (valor), nunca "null"
}

export default function FormPageClient({
  formId,
  def,
}: {
  formId: string;
  def: FormDefinition | null;
}) {
  if (!def) {
    return (
      <section className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold">Formulário não encontrado</h1>
        <p className="text-gray-600 mt-2">
          Verifique o identificador: <code>{formId}</code>.
        </p>
      </section>
    );
  }

  const engine = useFormEngine(def);
  const {
    methods,
    catIndex,
    setCatIndex,
    status,
    goPrev,
    goNext,
    onClear,
    setStatus,
    storageKey,
  } = engine;

  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => setMounted(true), []);

  const SCALE = useMemo(() => generateScale(RED, GREEN, 5), []);
  const colorForOption = (n: number) => SCALE[n - 1] ?? "#ddd";

  const allQuestions = useMemo(
    () => def.categories.flatMap((c) => c.questions),
    [def]
  );

  const filled = Object.values(methods.getValues()).filter(
    (v) => typeof v === "number" && v > 0
  ).length;

  const total = allQuestions.length;
  const progress = Math.round((filled / total) * 100);
  const cat = def.categories[catIndex];

  useEffect(() => {
    if (!cat || !def?.title) return;

    // 🔹 Timer de debounce para evitar chamadas duplicadas
    let debounceTimer: NodeJS.Timeout | null = null;

    const subscription = methods.watch((values: Record<string, any>) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // 🔹 Captura as respostas numéricas válidas
        const facetQuestions = cat.questions
          .map((q) => {
            let v = Number(values[q.id]);
            if (isNaN(v) || v <= 0) return null;

            // ✅ reverse certinho (usa q.reverse)
            if ((q as any).reverse) v = 6 - v;

            return v;
          })
          .filter((v) => v !== null);

        // 🔹 Só calcula se todas foram respondidas
        if (facetQuestions.length === cat.questions.length) {
          const soma = facetQuestions.reduce((acc, v) => acc + (v ?? 0), 0);
          const media = Number((soma / facetQuestions.length).toFixed(2));

          // 🔹 Define o nível com base na média
          let nivel: "baixo" | "medio" | "alto";
          if (media >= 1 && media <= 2.99) {
            nivel = "baixo";
          } else if (media >= 3 && media <= 3.99) {
            nivel = "medio";
          } else {
            nivel = "alto";
          }

          const fator = def.title.trim();
          const faceta = cat.title
            .trim()
            .replace(/^[\d.]+\s*/, "")
            .replace(/\(.*?\)/g, "")
            .trim();

          // ✅ tenta pegar pelo formId (mais confiável)
          let data = feedbackByFormId[formId];

          debugLog("fator(def.title):", fator);
          debugLog("formId:", formId);
          debugLog("cat.title (raw):", cat.title);
          debugLog("faceta (normalizada p/ busca):", faceta);

          // debug do nível inicial
          debugLog(
            "data inicial (origem):",
            feedbackByFormId[formId]
              ? "feedbackByFormId[formId]"
              : "feedbackDataMap[fator]",
            "tipo:",
            typeof data,
            "keys:",
            data && typeof data === "object" ? Object.keys(data) : null
          );

          // ajuda a visualizar o formato
          if (data && typeof data === "object") {
            debugLog("tem data.facetas?", Boolean((data as any).facetas));
            const ks = Object.keys(data as any);
            if (ks.length === 1) {
              const k0 = ks[0];
              debugLog(
                "única chave:",
                k0,
                "tem facetas dentro dela?",
                Boolean((data as any)[k0]?.facetas)
              );
              debugLog(
                "keys dentro da única chave:",
                (data as any)[k0] ? Object.keys((data as any)[k0]) : null
              );
            }
          }

          if (!data) {
            console.warn(
              "❌ Nenhum JSON encontrado para fator:",
              fator,
              "| formId:",
              formId
            );
            return;
          }

          const normalizar = (s: string) =>
            s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

          // 1) entra pela chave interna conhecida do formId
          const knownKey = factorKeyByFormId[formId];
          if (knownKey && (data as any)[knownKey]) {
            debugLog("knownKey aplicado:", knownKey);
            data = (data as any)[knownKey];
          }

          // 2) fallback antigo (se algum título bater com chave do JSON)
          const fatorKey = Object.keys(data).find(
            (k) => normalizar(k) === normalizar(fator)
          );
          debugLog("fatorKey encontrado:", fatorKey ?? null);
          if (fatorKey) data = (data as any)[fatorKey];

          debugLog(
            "data depois (knownKey/fatorKey) keys:",
            data && typeof data === "object" ? Object.keys(data) : null,
            "| tem facetas?",
            Boolean((data as any)?.facetas)
          );

          // 3) fallback genérico: se ainda estiver embrulhado em 1 chave
          if (data && !(data as any).facetas) {
            const ks = Object.keys(data as any);
            if (ks.length === 1 && (data as any)[ks[0]]?.facetas) {
              debugLog("unwrap genérico aplicado. Entrando em:", ks[0]);
              data = (data as any)[ks[0]];
            }
          }

          if (!(data as any)?.facetas) {
            console.warn("⚠️ Estrutura inesperada no JSON:", fator, data);
            return;
          }

          const facetaKey = Object.keys((data as any).facetas).find(
            (k) => normalizar(k) === normalizar(faceta)
          );

          debugLog("facetaKey encontrado:", facetaKey ?? null);
          if ((data as any)?.facetas) {
            debugLog("facetas disponíveis:", Object.keys((data as any).facetas));
          }

          if (!facetaKey) {
            console.warn("⚠️ Faceta não encontrada no JSON:", faceta);
            return;
          }

          // 🔹 Corrige a busca de feedback (ignora maiúsculas/minúsculas e acentos)
          const fb = (data as any).facetas[facetaKey]?.feedbackConsolidado || {};
          const fbKey = Object.keys(fb).find(
            (k) => normalizar(k) === normalizar(nivel)
          );
          const feedback = fbKey ? fb[fbKey] : null;

          if (!feedback) {
            console.warn("⚠️ Feedback não encontrado para nível:", nivel);
            return;
          }

          // 🔹 Evita reabrir o mesmo modal repetidamente
          if (
            feedbackContent?.faceta === facetaKey &&
            feedbackContent?.nivel === nivel &&
            modalOpen
          ) {
            return;
          }

          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setFeedbackContent({
              ...feedback,
              nivel,
              media: media.toFixed(2),
              faceta: facetaKey,
            });
            setModalOpen(true);
          }, 200);
        } else {
          setModalOpen(false);
        }
      }, 120);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cat, def.title]);

  return (
    <FormProvider {...methods}>
      <section className="py-8 px-4 sm:px-6 lg:py-12 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* 🔹 Sessão explicativa sobre a escala Likert */}
          <div className="mb-8 p-6 border border-blue-200 bg-blue-50 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              Como responder os formulários
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As afirmações a seguir utilizam uma <strong>escala de 1 a 5</strong>.
              Ela mede o quanto você <strong>concorda ou discorda</strong> de cada
              frase apresentada. Não existem respostas certas ou erradas — escolha
              aquela que melhor representa sua percepção pessoal.
            </p>

            {/* Exemplo visual da escala Likert */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 italic">
                Exemplo: 1 = Discordo totalmente · 5 = Concordo totalmente
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: UFSM_BLUE }}>
            {def.title}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            Característica {catIndex + 1} de {def.categories.length} —{" "}
            <strong>{cat.title}</strong>
          </p>

          <ProgressBar
            progress={progress}
            filledCount={filled}
            total={total}
            page={catIndex}
            numPages={def.categories.length}
          />

          <CategoryNav
            categories={def.categories.map((c) => ({ title: c.title }))}
            activeIndex={catIndex}
            onSelect={setCatIndex}
          />

          {/* Perguntas da faceta */}
          <div className="space-y-4">
            {cat.questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                id={q.id}
                label={`${i + 1}. ${q.label}`}
                control={methods.control}
                errorMessage={(methods.formState.errors as any)?.[q.id]?.message}
                scale={q.scale ?? 5}
                minLabel={q.minLabel ?? "Discordo totalmente"}
                maxLabel={q.maxLabel ?? "Concordo totalmente"}
              />
            ))}

            <PagerActions
              page={catIndex}
              numPages={def.categories.length}
              status={status}
              goPrev={goPrev}
              goNext={goNext}
              currentFieldIds={cat.questions.map((q) => q.id)}
              controlApi={{
                getValues: methods.getValues,
                setValue: methods.setValue,
                setStatus,
                storageKey,
              }}
            />


          </div>

          <p className="text-xs text-gray-500 mt-4">
            Suas respostas são salvas como rascunho neste navegador. A geração do
            PDF acontece somente na etapa final de envio (página de resumo).
          </p>
        </div>
      </section>

      {/* 🔹 Modal de feedback */}
      {mounted &&
        modalOpen &&
        feedbackContent &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh] animate-scaleUp border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                {feedbackContent.titulo}
              </h2>
              <p className="text-sm text-gray-600 mb-4 italic">
                {/*  ({feedbackContent.faceta}) — */} Nível:{" "}
                <span className="font-semibold text-blue-600 uppercase">
                  {feedbackContent.nivel}
                </span>{" "}
                | Média: {feedbackContent.media}
              </p>
              <p className="text-gray-700 mb-4">{feedbackContent.definicao}</p>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </FormProvider>
  );
}
