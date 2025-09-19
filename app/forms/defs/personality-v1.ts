import type { FormDefinition } from "../lib/types";

export const personalityV1: FormDefinition = {
  id: "personality-v1",
  title: "Teste de Personalidade",
  storageVersion: 1,

  // --- novos metadados para UI ---
  subtitle: "Mapeamento de traços e preferências",
  description:
    "Um teste rápido para entender aspectos do seu perfil pessoal e profissional, incluindo colaboração, autonomia e estilo de trabalho.",
  iconEmoji: "🧠",
  themeColor: "#0ea5e9", // tailwind sky-500
  tags: ["Psicologia", "Autoconhecimento", "Perfil"],
  estimatedMinutes: 5,
  totalQuestions: 16, // somando todas as categorias
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-15",
  author: "Equipe Research",

  // --- estrutura original ---
  categories: [
    {
      key: "x",
      title: "Categoria X",
      questions: [
        { id: "q1", type: "likert", label: "Gosto de trabalhar em equipe.", required: true },
        { id: "q2", type: "likert", label: "Prefiro planejamento cuidadoso a improvisar.", required: true },
        { id: "q3", type: "likert", label: "Tenho curiosidade por novas tecnologias.", required: true },
        { id: "q4", type: "likert", label: "Sou organizado para cumprir prazos.", required: true },
        { id: "q5", type: "likert", label: "Costumo assumir riscos quando vejo oportunidade.", required: true },
        { id: "q6", type: "likert", label: "Sinto-me motivado por desafios.", required: true },
        { id: "q7", type: "likert", label: "Busco feedback regularmente.", required: true },
        { id: "q8", type: "likert", label: "Sou persistente diante de dificuldades.", required: true },
      ],
    },
    {
      key: "y",
      title: "Categoria Y",
      questions: [
        { id: "q9",  type: "likert", label: "Gosto de trabalhar de forma autônoma.", required: true },
        { id: "q10", type: "likert", label: "Aprendo rapidamente com erros.", required: true },
        { id: "q11", type: "likert", label: "Comunico ideias com clareza.", required: true },
        { id: "q12", type: "likert", label: "Tenho facilidade em priorizar tarefas.", required: true },
      ],
    },
    {
      key: "t",
      title: "Teste 444",
      questions: [
        { id: "q13", type: "likert", label: "VAZIO VAZIO VAZIO", required: true },
        { id: "q14", type: "likert", label: "Aprendo rapidamente com erros.", required: true },
        { id: "q15", type: "likert", label: "Comunico ideias com clareza.", required: true },
        { id: "q16", type: "likert", label: "Tenho facilidade em priorizar tarefas.", required: true },
      ],
    },
  ],
};
