import type { FormDefinition } from "../lib/types";

export const extroversao: FormDefinition = {
  id: "extroversao",
  title: "Extroversão",
  storageVersion: 1,

  // --- metadados para UI ---
  subtitle: "Acolhimento, assertividade e emoções positivas",
  description:
    "Avalie como você se relaciona socialmente, expressa opiniões e mantém emoções positivas no contexto da UFSM.",
  iconEmoji: "🎤",
  themeColor: "#f59e0b", // tailwind amber-500
  tags: ["Personalidade", "Bem-estar", "Docência"],
  estimatedMinutes: 3,
  totalQuestions: 18,
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-22",
  author: "Equipe de Produto",

  categories: [
    // 2.1 Acolhimento
    {
      key: "acolhimento",
      title: "2.1. Acolhimento",
      questions: [
        {
          id: "e1",
          type: "likert",
          label:
            "Gosto de apoiar e motivar estudantes, servidores técnicos ou colegas que enfrentam dificuldades pessoais ou profissionais.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e2",
          type: "likert",
          label:
            "Sinto satisfação em compartilhar materiais didáticos, referências bibliográficas e dicas de avaliação.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e3",
          type: "likert",
          label:
            "Procuro ser acolhedor(a) com discentes que têm problemas acadêmicos ou pessoais, orientando-os para soluções ou serviços de apoio.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e4",
          type: "likert",
          label:
            "Prefiro ajudar quem tem dúvidas do que manter as informações apenas comigo.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e5",
          type: "likert",
          label:
            "Tenho o hábito de incentivar a colaboração entre colegas, promovendo um ambiente de trabalho mais solidário.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e6",
          type: "likert",
          label:
            "Ao perceber que alguém está isolado ou com dificuldades, tomo a iniciativa de oferecer apoio ou abrir espaço para diálogo.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },

    // 2.3 Assertividade
    {
      key: "assertividade",
      title: "2.2. Assertividade",
      questions: [
        {
          id: "e7",
          type: "likert",
          label:
            "Não tenho medo de expor minhas opiniões em conselhos de centro, colegiados ou reuniões do departamento.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e8",
          type: "likert",
          label:
            "Assumo a liderança em projetos coletivos ou grupos de trabalho quando ninguém toma a iniciativa.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e9",
          type: "likert",
          label:
            "Defendo meu ponto de vista, mesmo que seja diferente da maioria.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e10",
          type: "likert",
          label:
            "Tenho facilidade em apresentar propostas e resultados em eventos ou reuniões.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e11",
          type: "likert",
          label:
            "Sinto-me confortável em solicitar recursos ou condições necessárias para desempenhar bem minhas funções.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e12",
          type: "likert",
          label:
            "Consigo manter a firmeza ao me posicionar, mesmo em situações de pressão ou quando enfrento resistência.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },

    // 2.6 Emoções Positivas
    {
      key: "emocoes_positivas",
      title: "2.3. Emoções Positivas",
      questions: [
        {
          id: "e13",
          type: "likert",
          label:
            "Sinto grande satisfação ao ver o desenvolvimento dos(as) discentes nas disciplinas que ministro.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e14",
          type: "likert",
          label:
            "Celebrar pequenas vitórias (como um artigo aceito, uma turma engajada ou projetos bem-sucedidos) me traz ânimo para continuar inovando.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e15",
          type: "likert",
          label:
            "Consigo manter uma atitude positiva mesmo quando os desafios pessoais e profissionais se tornam mais complexos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e16",
          type: "likert",
          label:
            "Sinto alegria ao pensar em contribuir para a formação de futuros profissionais e pesquisadores.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e17",
          type: "likert",
          label:
            "Reconhecer o impacto positivo do meu trabalho na UFSM me inspira a manter o entusiasmo e a dedicação nas atividades diárias.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "e18",
          type: "likert",
          label:
            "Mesmo quando alcanço bons resultados, tenho dificuldade em sentir satisfação ou motivação para continuar investindo no meu trabalho.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
  ],
};
