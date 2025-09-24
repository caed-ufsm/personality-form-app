import type { FormDefinition } from "../lib/types";

export const conscienciosidadeV1: FormDefinition = {
  id: "conscienciosidade",
  title: "Conscienciosidade",
  storageVersion: 1,

  // --- metadados para UI ---
  subtitle: "Responsabilidade, organização, disciplina e persistência",
  description:
    "Avalia responsabilidade, organização, disciplina e persistência no contexto docente da UFSM.",
  iconEmoji: "📋",
  themeColor: "#a855f7", // tailwind blue-500
  tags: ["Personalidade", "Docência", "Gestão Acadêmica"],
  estimatedMinutes: 15,
  totalQuestions: 24, // ajustar depois conforme todas as facetas incluídas
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-22",
  author: "Equipe de Produto",

  categories: [
    // 5.1 Autoeficácia
    {
      key: "autoeficacia",
      title: "5.1. Autoeficácia",
      questions: [
        {
          id: "c1",
          type: "likert",
          label:
            "Confio na minha habilidade de planejar e ministrar disciplinas, desde que eu me dedique adequadamente.",
          required: true,
        },
        {
          id: "c2",
          type: "likert",
          label:
            "Sinto-me seguro(a) de que, com estudo consistente, consigo aprofundar meus conhecimentos para responder às demandas acadêmicas.",
          required: true,
        },
        {
          id: "c3",
          type: "likert",
          label:
            "Reconheço que o desenvolvimento de competências em ensino, pesquisa e extensão é contínuo, mas acredito no meu potencial.",
          required: true,
        },
        {
          id: "c4",
          type: "likert",
          label:
            "Mesmo quando enfrento uma disciplina ou tema novo, confio que posso dominá-lo com planejamento e prática.",
          required: true,
        },
        {
          id: "c5",
          type: "likert",
          label:
            "Persisto em encontrar soluções criativas e eficazes para dificuldades que surgem no exercício da docência ou na gestão de projetos.",
          required: true,
        },
        {
          id: "c6",
          type: "likert",
          label:
            "[R] Sinto que não tenho recursos suficientes para lidar com imprevistos que afetam minhas aulas ou projetos.",
          required: true,
          reverse: true,
        },
      ],
    },

    // 5.2 Ordem
    {
      key: "ordem",
      title: "5.2. Ordem",
      questions: [
        {
          id: "c7",
          type: "likert",
          label:
            "Gosto de organizar meus arquivos digitais e físicos (planos de aula, artigos, projetos) de forma lógica e acessível.",
          required: true,
        },
        {
          id: "c8",
          type: "likert",
          label:
            "Minha sala ou local de trabalho costuma permanecer arrumado e pronto para receber discentes ou colegas.",
          required: true,
        },
        {
          id: "c9",
          type: "likert",
          label:
            "Uso calendários, planilhas ou aplicativos para gerir prazos de correção, reuniões e entrega de projetos.",
          required: true,
        },
        {
          id: "c10",
          type: "likert",
          label:
            "Planejo meus dias de acordo com as prioridades, incluindo aulas, pesquisa, extensão e tempo de descanso.",
          required: true,
        },
        {
          id: "c11",
          type: "likert",
          label:
            "Tenho métodos claros para arquivar documentos e manter o controle sobre versões atualizadas de materiais de aula e pesquisa.",
          required: true,
        },
        {
          id: "c12",
          type: "likert",
          label:
            "[R] Frequentemente deixo documentos e tarefas acumularem a ponto de dificultar o andamento das minhas atividades.",
          required: true,
          reverse: true,
        },
      ],
    },

    // 5.3 Autodisciplina
    {
      key: "autodisciplina",
      title: "5.3. Autodisciplina",
      questions: [
        {
          id: "c13",
          type: "likert",
          label:
            "Mantenho a concentração na elaboração de aulas ou artigos, mesmo se houver distrações ou demandas paralelas.",
          required: true,
        },
        {
          id: "c14",
          type: "likert",
          label:
            "Consigo seguir meu planejamento de semestre sem precisar de supervisão externa, cumprindo prazos e metas.",
          required: true,
        },
        {
          id: "c15",
          type: "likert",
          label:
            "Não adio revisões ou correções de avaliações, mesmo sendo uma tarefa cansativa.",
          required: true,
        },
        {
          id: "c16",
          type: "likert",
          label:
            "Controlo meu tempo de lazer e atividades extras para não prejudicar a qualidade do ensino ou atrasar os compromissos institucionais.",
          required: true,
        },
        {
          id: "c17",
          type: "likert",
          label:
            "Sou capaz de manter a produtividade mesmo em períodos prolongados de alta demanda acadêmica.",
          required: true,
        },
        {
          id: "c18",
          type: "likert",
          label:
            "[R] Frequentemente interrompo atividades importantes para atender a tarefas menos prioritárias, perdendo o foco no que é essencial.",
          required: true,
          reverse: true,
        },
      ],
    },

    // 5.4 Ponderação (Cautela)
    {
      key: "ponderacao",
      title: "5.4. Ponderação (Cautela)",
      questions: [
        {
          id: "c19",
          type: "likert",
          label:
            "Penso cuidadosamente ao traçar metas (disciplinas, publicações, projetos) para cada semestre ou ano.",
          required: true,
        },
        {
          id: "c20",
          type: "likert",
          label:
            "Analiso consequências antes de propor mudanças radicais no plano de ensino ou na proposta de pesquisa.",
          required: true,
        },
        {
          id: "c21",
          type: "likert",
          label:
            "Evito decisões precipitadas sobre metodologias, cronogramas de aulas ou convites para participar de comissões.",
          required: true,
        },
        {
          id: "c22",
          type: "likert",
          label:
            "Reflito sobre prós e contras antes de assumir novos projetos, pensando em carga horária e viabilidade.",
          required: true,
        },
        {
          id: "c23",
          type: "likert",
          label:
            "Costumo buscar conselhos ou informações adicionais antes de tomar decisões que impactem significativamente meu trabalho.",
          required: true,
        },
        {
          id: "c24",
          type: "likert",
          label:
            "[R] Frequentemente aceito tarefas ou mudanças importantes sem avaliar de forma aprofundada suas implicações.",
          required: true,
          reverse: true,
        },
      ],
    },
  ],
};
