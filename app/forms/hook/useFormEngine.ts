"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import type { z } from "zod";
import { useForm, FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormDefinition } from "../lib/types";
import { schemaFromConfig } from "../lib/schemaFromConfig";

export function useFormEngine(def: FormDefinition) {
  const { edit, strict } = useMemo(() => schemaFromConfig(def), [def]);

  type FormValues = z.infer<typeof edit>;
  type Path = FieldPath<FormValues>;

  const storageKey = `${def.id}:v${def.storageVersion ?? 1}`;

  // ✅ 1) Sempre inicia igual no SSR e no primeiro render do client
  const methods = useForm<FormValues>({
    resolver: zodResolver(edit),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {} as FormValues,
  });

  const { watch, getValues, setError, reset, handleSubmit, control, formState } = methods;

  // status e categoria ativa
  const [catIndex, setCatIndex] = useState(0);
  const [status, setStatus] = useState<null | "idle" | "saving" | "saved" | "error">("idle");

  // ✅ 2) Depois que montar, puxa do localStorage e aplica com reset()
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as FormValues;
      reset(parsed); // aplica os valores sem quebrar hidratação
    } catch {
      // ignora
    }
  }, [storageKey, reset]);

  // autosave simples (qualquer mudança)
  useEffect(() => {
    let timeoutId: number | undefined;

    const subscription = watch(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(getValues()));
        setStatus("saved");
        if (timeoutId) window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => setStatus("idle"), 700);
      } catch {
        setStatus("error");
      }
    });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      subscription?.unsubscribe?.();
    };
  }, [watch, getValues, storageKey]);

  const validateCurrentCategory = useCallback(() => {
    const cat = def.categories[catIndex];
    const vals = getValues();
    for (const q of cat.questions) {
      if (!q.required) continue;
      const v = vals[q.id as keyof typeof vals] as number;
      if (typeof v !== "number" || v < 1) {
        setError(q.id as Path, { type: "required", message: "Selecione uma opção" });
        return { ok: false, firstId: q.id } as const;
      }
    }
    return { ok: true } as const;
  }, [def.categories, catIndex, getValues, setError]);

  const goNext = useCallback(() => {
    const ok = validateCurrentCategory();
    if (!ok.ok) {
      const el = document.getElementById(ok.firstId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setCatIndex((i) => Math.min(def.categories.length - 1, i + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [def.categories.length, validateCurrentCategory]);

  const goPrev = useCallback(() => {
    setCatIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onClear = useCallback(() => {
    reset({});
    localStorage.removeItem(storageKey);
    setCatIndex(0);
  }, [reset, storageKey]);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setStatus("saving");
      const parsed = strict.safeParse(values);
      if (!parsed.success) {
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(`/api/forms/${def.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        if (!res.ok) {
          setStatus("error");
          return;
        }
        localStorage.removeItem(storageKey);
        setStatus("saved");
        window.setTimeout(() => setStatus("idle"), 1000);
      } catch {
        setStatus("error");
      }
    },
    [def.id, strict, storageKey]
  );

  return {
    def,
    methods: { ...methods, handleSubmit, control, formState },
    catIndex,
    setCatIndex,
    status,
    setStatus,
    goNext,
    goPrev,
    onClear,
    onSubmit,
    storageKey,
  };
}
