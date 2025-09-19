"use client";

import { useEffect, useRef } from "react";
import { useForm, type FieldValues } from "react-hook-form";

const DRAFT_KEY = "form_draft";

type StatusSetter = React.Dispatch<
  React.SetStateAction<null | "idle" | "saving" | "saved" | "error">
>;

export function useAutosave<T extends FieldValues>(
  watch: ReturnType<typeof useForm<T>>["watch"],
  getValues: ReturnType<typeof useForm<T>>["getValues"],
  range: { start: number; end: number },
  setStatus: StatusSetter
) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const sub = watch((_, info) => {
      if (!info?.name) return;
      const m = /^answers\.(\d+)$/.exec(String(info.name));
      if (!m) return;

      const idx = Number(m[1]);
      if (idx < range.start || idx >= range.end) return;

      if (timerRef.current) window.clearTimeout(timerRef.current);
      setStatus("saving");

      timerRef.current = window.setTimeout(() => {
        try {
          const data = getValues();
          localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
          setStatus("saved");
          window.setTimeout(() => setStatus("idle"), 700);
        } catch {
          setStatus("error");
        }
      }, 600);
    });

    return () => {
      sub.unsubscribe();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [watch, getValues, range.start, range.end, setStatus]);
}
