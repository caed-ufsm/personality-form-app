// app/forms/lib/registry.ts
import type { FormDefinition } from "./types";
import { personalityV1 } from "../defs/personality-v1";
import { feedbackV1 } from "../defs/feedback-v1";

const REGISTRY: Record<string, FormDefinition> = {
  "personality-v1": personalityV1,
  "feedback-v1": feedbackV1,
};

export function getFormDefinition(formId: string): FormDefinition | null {
  return REGISTRY[formId] ?? null;
}

export function getAllForms(): FormDefinition[] {
  return Object.values(REGISTRY);
}
