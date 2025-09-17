import { z } from "zod";
import type { FormDefinition } from "./types";

export function schemaFromConfig(def: FormDefinition) {
  const all = def.categories.flatMap((c) => c.questions);

  const editShape: Record<string, z.ZodTypeAny> = {};
  const strictShape: Record<string, z.ZodTypeAny> = {};

  for (const q of all) {
    if (q.type !== "likert") continue;
    const scale = q.scale ?? 5;

    // edição: permite 0 (não respondido)
    editShape[q.id] = z.number().int().min(0).max(scale).default(0);

    // envio final: se required -> 1..scale; se opcional -> 0..scale (ou omitido)
    strictShape[q.id] = q.required
      ? z.number().int().min(1).max(scale)
      : z.number().int().min(0).max(scale);
  }

  const edit = z.object(editShape);
  const strict = z.object(strictShape);

  return { edit, strict, allIds: all.map((q) => q.id) };
}
