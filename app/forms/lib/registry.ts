// app/forms/lib/registry.ts
import type { FormDefinition } from "./types";
import { neuroticismV1 } from "../defs/neuroticismo";
import { extroversaoV1 } from "../defs/extroversao";
import { aberturaExperienciaV1 } from "../defs/aberturaExperiencia";
import { amabilidadeV1 } from "../defs/amabilidade";
import { conscienciosidadeV1 } from "../defs/conscienciosidade";

const REGISTRY: Record<string, FormDefinition> = {
  "neuroticismo-v1": neuroticismV1,
  "extroversao-v1": extroversaoV1,
  "abertura-experiencia-v1": aberturaExperienciaV1,
  "amabilidade-v1": amabilidadeV1,
  "conscienciosidade-v1": conscienciosidadeV1,
};

export function getFormDefinition(formId: string): FormDefinition | null {
  return REGISTRY[formId] ?? null;
}

export function getAllForms(): FormDefinition[] {
  return Object.values(REGISTRY);
}
