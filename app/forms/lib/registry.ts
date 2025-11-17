// app/forms/lib/registry.ts
import type { FormDefinition } from "./types";
import { neuroticismo } from "../defs/neuroticismo";
import { extroversao } from "../defs/extroversao";
import { aberturaExperienciaV1 } from "../defs/aberturaExperiencia";
import { amabilidadeV1 } from "../defs/amabilidade";
import { conscienciosidadeV1 } from "../defs/conscienciosidade";

const REGISTRY: Record<string, FormDefinition> = {
  neuroticismo,
  extroversao,
  aberturaexperiencia: aberturaExperienciaV1,
  amabilidade: amabilidadeV1,
  conscienciosidade: conscienciosidadeV1,
};

export function getFormDefinition(formId: string): FormDefinition | null {
  return REGISTRY[formId] ?? null;
}

export function getAllForms(): FormDefinition[] {
  return Object.values(REGISTRY).sort((a, b) => 
    a.id.localeCompare(b.id)
  );
}
