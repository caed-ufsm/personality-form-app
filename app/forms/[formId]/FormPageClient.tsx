"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
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

// 🔹 Mapeia os fatores para seus respectivos arquivos JSON
const feedbackDataMap: Record<string, any> = {
  Neuroticismo: neuroticismoData,
  Extroversão: extroversaoData,
  Conscienciosidade: conscienciaData,
  Amabilidade: amabilidadeData,
  "Abertura à Experiência": aberturaData,
};

// 🔹 Ordem dos formulários — personalize aqui
const FORM_ORDER = [
  "neuroticismo",
  "extroversao",
  "amabilidade",
  "conscienciosidade",
  "abertura-experiencia",
];

// 🔹 Função auxiliar: encontra o próximo formulário
function getNextFormId(currentId: string) {
  const idx = FORM_ORDER.indexOf(currentId);
  if (idx >= 0 && idx < FORM_ORDER.length - 1) {
    return FORM_ORDER[idx + 1];
  }
  // se for o último, volta para lista geral
  return "/forms";
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

  // 🔹 Efeito reativo: detecta mudanças nas respostas e mostra feedback
  useEffect(() => {
    const subscription = methods.watch((values) => {
      const facetQuestions = cat.questions
        .map((q) => Number(values[q.id]))
        .filter((v) => !isNaN(v));

      if (facetQuestions.length === cat.questions.length) {
        const media =
          facetQuestions.reduce((acc: number, v: number) => acc + v, 0) /
          facetQuestions.length;

        let nivel: "baixo" | "medio" | "alto" =
          media <= 2 ? "baixo" : media === 3 ? "medio" : "alto";

        const fator = def.title.trim();
        const faceta = cat.title
          .trim()
          .replace(/^[\d.]+\s*/, "") // remove prefixos tipo 1.1
          .replace(/\(.*?\)/g, "") // remove parênteses
          .trim();

        console.log("🧠 Fator:", fator);
        console.log("📘 Faceta:", faceta);
        console.log("📊 Média:", media.toFixed(2), "| Nível:", nivel);

        let data = feedbackDataMap[fator];
        if (!data) {
          console.warn("❌ Nenhum JSON encontrado para fator:", fator);
          return;
        }

        const normalizar = (s: string) =>
          s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const fatorKey = Object.keys(data).find(
          (k) => normalizar(k) === normalizar(fator)
        );
        if (fatorKey) data = data[fatorKey];

        if (!data.facetas) {
          console.warn("⚠️ Estrutura inesperada no JSON:", fator, data);
          return;
        }

        const facetaKey = Object.keys(data.facetas).find(
          (k) => normalizar(k) === normalizar(faceta)
        );

        if (!facetaKey) {
          console.warn("⚠️ Faceta não encontrada no JSON:", faceta);
          return;
        }

        const feedback = data.facetas[facetaKey]?.feedbackConsolidado?.[nivel];
        if (feedback) {
          console.log("✅ Feedback encontrado:", feedback.titulo);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            setFeedbackContent({
              ...feedback,
              nivel,
              media: media.toFixed(2),
              faceta: facetaKey,
            });
            setModalOpen(true);
          }, 400);
        }
      } else {
        setModalOpen(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cat, catIndex, def.title, methods]);

  return (
    <FormProvider {...methods}>
      <section className="py-8 px-4 sm:px-6 lg:py-12 bg-white">
        <div className="max-w-3xl mx-auto">

          {/* 🔹 Sessão explicativa sobre a escala Likert */}
          <div className="mb-8 p-6 border border-blue-200 bg-blue-50 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              Como responder às perguntas
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              As afirmações a seguir utilizam uma <strong>escala de 1 a 5</strong>, conhecida
              como <strong>escala de Likert</strong>. Ela mede o quanto você{" "}
              <strong>concorda ou discorda</strong> de cada frase apresentada.
              Não existem respostas certas ou erradas — escolha aquela que melhor
              representa sua percepção pessoal.
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
              onClear={onClear}
              controlApi={{
                getValues: methods.getValues,
                setStatus,
                storageKey,
              }}
            />

            {/* 🔹 Botão de próximo formulário */}
            {catIndex === def.categories.length - 1 && (
              <div className="mt-8 flex justify-end">
                <Link
                  href={`/forms/${getNextFormId(formId)}`}
                  className="bg-[#0353a3] hover:bg-blue-800 text-white px-6 py-3 rounded-lg text-base font-medium transition"
                >
                  Próximo formulário →
                </Link>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Suas respostas são salvas como rascunho neste navegador. A geração
            do PDF acontece somente na etapa final de envio (página de resumo).
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
                ({feedbackContent.faceta}) — Nível:{" "}
                <span className="font-semibold text-blue-600 uppercase">
                  {feedbackContent.nivel}
                </span>{" "}
                | Média: {feedbackContent.media}
              </p>
              <p className="text-gray-700 mb-4">{feedbackContent.definicao}</p>
              <p className="text-gray-700 font-medium">
                {feedbackContent.conclusao}
              </p>
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
