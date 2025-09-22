import type { FormDefinition } from "../lib/types";

export const neuroticismV1: FormDefinition = {
  id: "neuroticismo-v1",
  title: "Neuroticismo",
  storageVersion: 1,

  // --- metadados para UI ---
  subtitle: "Avaliação de facetas do Neuroticismo",
  description:
    "Avalie como você vivencia emoções e reações (ansiedade, irritação, desânimo, vergonha e impulsividade) no contexto da carreira docente.",
  iconEmoji: "🧠",
  themeColor: "#ef4444", // tailwind red-500
  tags: ["Personalidade", "Bem-estar", "Docência"],
  estimatedMinutes: 8,
  totalQuestions: 30,
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-22",
  author: "Equipe de Produto",

  // --- facetas (categorias) ---
  categories: [
    {
      key: "anxiety",
      title: "1.1. Ansiedade",
      questions: [
        {
          id: "n1",
          type: "likert",
          label:
            "Sinto preocupação constante com prazos de lançamento de notas, elaboração de relatórios e outras exigências burocráticas.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n2",
          type: "likert",
          label:
            "Fico nervoso(a) ao pensar em possíveis avaliações (por exemplo, avaliações institucionais ou pareceres) que possam julgar meu desempenho.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n3",
          type: "likert",
          label:
            "Em algumas fases do semestre, perco o sono por temer não conseguir cumprir todas as atividades profissionais.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n4",
          type: "likert",
          label:
            "Meu coração acelera diante de situações que envolvem cobranças ou mudanças repentinas na grade ou no plano de aula.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n5",
          type: "likert",
          label:
            "Em momentos de alta pressão institucional, tenho dificuldade para manter a calma e me desligar mentalmente das obrigações.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n6",
          type: "likert",
          label:
            "[R] Quando percebo sinais físicos de ansiedade (como insônia, tensão muscular ou aceleração dos batimentos), busco estratégias para retomar o equilíbrio emocional.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
    {
      key: "hostility",
      title: "1.2. Hostilidade (Raiva)",
      questions: [
        {
          id: "n7",
          type: "likert",
          label:
            "Fico irritado(a) quando alguém interrompe minhas atividades de forma abrupta.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n8",
          type: "likert",
          label:
            "Quando acho que meu cronograma está sendo prejudicado por reuniões excessivas ou demandas de última hora, sinto que posso “explodir”.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n9",
          type: "likert",
          label:
            "Às vezes, sinto raiva de colegas que parecem ter facilidades administrativas ou infraestrutura superior à minha.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n10",
          type: "likert",
          label:
            "Incomoda-me profundamente quando meu trabalho (de extensão ou pesquisa) é subestimado ou minimizado por outros.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n11",
          type: "likert",
          label:
            "Fico impaciente quando preciso refazer tarefas devido a falhas ou atrasos causados por outras pessoas.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n12",
          type: "likert",
          label:
            "[R] Quando percebo que estou prestes a reagir com irritação, consigo parar e evitar uma resposta impulsiva.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
    {
      key: "depression",
      title: "1.3. Depressão (Desânimo)",
      questions: [
        {
          id: "n13",
          type: "likert",
          label:
            "Com frequência, sinto desânimo quanto ao futuro da minha carreira acadêmica, achando que não conseguirei avançar nos projetos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n14",
          type: "likert",
          label:
            "Tenho momentos em que me sinto sem esperança sobre a progressão na carreira (promoções, estabilidade de projetos).",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n15",
          type: "likert",
          label:
            "Fico triste quando percebo que meus projetos de pesquisa ou as turmas que leciono não evoluem como eu esperava.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n16",
          type: "likert",
          label:
            "Em alguns dias, penso em desistir de novas iniciativas (como projetos pessoais e profissionais) por achar que não darei conta.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n17",
          type: "likert",
          label:
            "Sinto dificuldade para me motivar, mesmo quando as tarefas são importantes para meus objetivos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n18",
          type: "likert",
          label:
            "[R] Quando percebo sinais de desânimo, busco estratégias ativas para retomar a motivação, como redefinir metas ou pedir apoio.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
    {
      key: "self_consciousness",
      title: "1.4. Autoconsciência (Vergonha)",
      questions: [
        {
          id: "n19",
          type: "likert",
          label:
            "Fico envergonhado(a) ao cometer falhas na frente de colegas ou discentes.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n20",
          type: "likert",
          label:
            "Sinto-me desconfortável em receber feedbacks críticos sobre meus planos de ensino ou projetos de pesquisa, pois temo julgamentos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n21",
          type: "likert",
          label:
            "Evito propor ideias em reuniões departamentais para não parecer despreparado(a) ou inexperiente.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n22",
          type: "likert",
          label:
            "Muitas vezes, deixo de compartilhar problemas de sala de aula com outros docentes, com receio de ser visto(a) como incompetente.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n23",
          type: "likert",
          label:
            "Evito buscar apoio em situações de dificuldade por receio de parecer fraco(a) ou incapaz.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n24",
          type: "likert",
          label:
            "[R] Quando percebo vergonha ou insegurança, consigo reconhecer o sentimento e, mesmo assim, tomar atitudes construtivas para melhor lidar com a situação.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
    {
      key: "impulsivity",
      title: "1.5. Impulsividade",
      questions: [
        {
          id: "n25",
          type: "likert",
          label:
            "Abandono meu plano de estudos ou de elaboração de aula para fazer algo mais agradável, mesmo sabendo que vou me arrepender depois.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n26",
          type: "likert",
          label:
            "Se estou cansado(a) da rotina, paro de preparar minhas aulas na hora, sem pensar nas consequências para a semana letiva.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n27",
          type: "likert",
          label:
            "Tendo a gastar muito tempo em redes sociais, mesmo sabendo que isso pode me prejudicar.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n28",
          type: "likert",
          label:
            "Faço pausas muito maiores do que o estipulado na minha rotina de trabalho, mesmo quando estou atrasado(a).",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n29",
          type: "likert",
          label:
            "Muitas vezes, começo novas atividades antes de concluir as que já estão em andamento, comprometendo prazos e resultados.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "n30",
          type: "likert",
          label:
            "[R] Quando percebo que estou cedendo a distrações, consigo redirecionar minha atenção para a atividade principal e retomar o foco.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
  ],
};
