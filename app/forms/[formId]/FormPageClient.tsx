"use client";

import React, { useMemo } from "react";
import type { FormDefinition } from "../lib/types";
import { FormProvider } from "react-hook-form";
import { useFormEngine } from "../hook/useFormEngine";
import ProgressBar from "../../../components/forms/progressbar";
import CategoryNav from "../../../components/forms/categorynav";
import QuestionItem from "../../../components/forms/questionitem";
import PagerActions from "../../../components/forms/pageractions";
import { generateScale } from "../lib/color";
import { RED, GREEN, UFSM_BLUE } from "../lib/theme";

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
    onSubmit,
    goPrev,
    goNext,
    onClear,
    setStatus,
    storageKey,
  } = engine;

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

  return (
    <FormProvider {...methods}>
      <section className="py-8 px-4 sm:px-6 lg:py-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: UFSM_BLUE }}>
            {def.title}
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            Categoria {catIndex + 1} de {def.categories.length} —{" "}
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

          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            {cat.questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                id={q.id}
                label={`${i + 1}. ${q.label}`}
                control={methods.control}
                errorMessage={(methods.formState.errors as any)?.[q.id]?.message}
                colorForOption={colorForOption}
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

            <p className="text-xs text-gray-500 mt-2">
              Você pode salvar o rascunho e continuar depois.
            </p>
          </form>
        </div>
      </section>
    </FormProvider>
  );
}
