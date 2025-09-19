import type { FormDefinition } from "../lib/types";

export const feedbackV1: FormDefinition = {
  id: "feedback-v1",
  title: "Formulário de Feedback",
  storageVersion: 1,

  // --- novos metadados para UI ---
  subtitle: "Avaliação de colaboração e processos",
  description:
    "Ajude-nos a melhorar continuamente dando seu feedback sobre alinhamento, execução e cultura do time.",
  iconEmoji: "💬",
  themeColor: "#22c55e", // tailwind green-500
  tags: ["Time", "Produto", "Cultura"],
  estimatedMinutes: 8,
  totalQuestions: 30, // já sabemos pelas categorias
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-15",
  author: "Equipe de Produto",

  // --- estrutura original ---
  categories: [
    {
      key: "context",
      title: "Contexto & Objetivos",
      questions: [
        { id: "q1",  type: "likert", label: "Tenho clareza sobre as metas do time.", required: true },
        { id: "q2",  type: "likert", label: "Entendo como meu trabalho impacta os objetivos do produto.", required: true },
        { id: "q3",  type: "likert", label: "As prioridades estão bem definidas.", required: true },
        { id: "q4",  type: "likert", label: "Recebo contexto suficiente para tomar decisões.", required: true },
        { id: "q5",  type: "likert", label: "Critérios de sucesso estão claros para cada entrega.", required: true },
      ],
    },
    {
      key: "collab_comm",
      title: "Colaboração & Comunicação",
      questions: [
        { id: "q6",  type: "likert", label: "A comunicação no time é aberta e respeitosa.", required: true },
        { id: "q7",  type: "likert", label: "Alinhamentos evitam retrabalho.", required: true },
        { id: "q8",  type: "likert", label: "As decisões são registradas e fáceis de consultar.", required: true },
        { id: "q9",  type: "likert", label: "Feedbacks são dados com frequência e de forma construtiva.", required: true, minLabel: "Nunca", maxLabel: "Sempre" },
        { id: "q10", type: "likert", label: "Sinto-me à vontade para discordar com respeito.", required: true },
      ],
    },
    {
      key: "execution",
      title: "Execução & Entregas",
      questions: [
        { id: "q11", type: "likert", label: "Planejamos entregas com escopo e prazos realistas.", required: true },
        { id: "q12", type: "likert", label: "Bloqueios são sinalizados e resolvidos rapidamente.", required: true, minLabel: "Nunca", maxLabel: "Sempre" },
        { id: "q13", type: "likert", label: "Cumprimos compromissos assumidos com stakeholders.", required: true },
        { id: "q14", type: "likert", label: "Há boa coordenação entre áreas (ex.: produto, design, engenharia).", required: true },
        { id: "q15", type: "likert", label: "Conseguimos balancear velocidade e qualidade.", required: true },
      ],
    },
    {
      key: "quality",
      title: "Qualidade & Boas Práticas",
      questions: [
        { id: "q16", type: "likert", label: "Seguimos padrões de código/boas práticas de forma consistente.", required: true },
        { id: "q17", type: "likert", label: "Testes automatizados dão confiança nas mudanças.", required: true },
        { id: "q18", type: "likert", label: "Revisões (code review/design review) agregam valor real.", required: true },
        { id: "q19", type: "likert", label: "Monitoramento e logs permitem detectar problemas cedo.", required: true },
        { id: "q20", type: "likert", label: "Incidentes geram aprendizados documentados.", required: true },
      ],
    },
    {
      key: "ownership",
      title: "Autonomia & Protagonismo",
      questions: [
        { id: "q21", type: "likert", label: "Tenho autonomia suficiente para executar meu trabalho.", required: true },
        { id: "q22", type: "likert", label: "Consigo tomar decisões sem depender de aprovações excessivas.", required: true },
        { id: "q23", type: "likert", label: "Sinto-me responsável pelo impacto do que entrego.", required: true },
        { id: "q24", type: "likert", label: "Tenho espaço para sugerir melhorias e experimentar.", required: true },
        { id: "q25", type: "likert", label: "Erros são tratados como oportunidades de aprendizado.", required: true },
      ],
    },
    {
      key: "growth",
      title: "Crescimento & Desenvolvimento",
      questions: [
        { id: "q26", type: "likert", label: "Recebo feedbacks que me ajudam a evoluir.", required: true, minLabel: "Nunca", maxLabel: "Sempre" },
        { id: "q27", type: "likert", label: "Tenho clareza sobre próximos passos na carreira.", required: true },
        { id: "q28", type: "likert", label: "Tenho oportunidades de aprender novas habilidades.", required: true },
        { id: "q29", type: "likert", label: "Meu trabalho é reconhecido de forma justa.", required: true },
        { id: "q30", type: "likert", label: "Recomendaria trabalhar neste time para outras pessoas.", required: true, minLabel: "Discordo", maxLabel: "Concordo" },
      ],
    },
  ],
};
