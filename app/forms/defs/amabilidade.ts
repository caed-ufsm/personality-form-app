import type { FormDefinition } from "../lib/types";

export const amabilidadeV1: FormDefinition = {
  id: "amabilidade",
  title: "Amabilidade",
  storageVersion: 1,

  // --- metadados para UI ---
  subtitle: "Confiança, franqueza, complacência e sensibilidade",
  description:
    "Avalie cooperação, empatia e cordialidade nas relações acadêmicas (discentes, colegas e gestão) no contexto da UFSM.",
  iconEmoji: "🤝",
  themeColor: "#10b981", // tailwind emerald-500
  tags: ["Personalidade", "Relações Interpessoais", "Docência"],
  estimatedMinutes: 10,
  totalQuestions: 24,
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-22",
  author: "Equipe de Produto",

  categories: [
    // 4.1 Confiança
    {
      key: "confianca",
      title: "4.1. Confiança",
      questions: [
        {
          id: "a1",
          type: "likert",
          label:
            "Creio que a gestão (chefias, direções) normalmente age visando o melhor para a comunidade universitária.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a2",
          type: "likert",
          label:
            "Tenho facilidade em confiar em colegas de departamento para desenvolver projetos conjuntos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a3",
          type: "likert",
          label:
            "Assumo que a maioria das pessoas age com integridade e interesse no bem coletivo.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a4",
          type: "likert",
          label:
            "Confio que os processos e avaliações institucionais são justos, ainda que rigorosos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a5",
          type: "likert",
          label:
            "Acredito que a colaboração mútua entre docentes e gestão fortalece o desenvolvimento da universidade.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a6",
          type: "likert",
          label:
            "Prefiro manter distância nas relações profissionais, pois acredito que confiar excessivamente pode trazer prejuízos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },

    // 4.2 Franqueza
    {
      key: "franqueza",
      title: "4.2. Franqueza",
      questions: [
        {
          id: "a7",
          type: "likert",
          label:
            "Prefiro ser honesto(a) com meus pares e estudantes sobre os desafios e limitações de cada disciplina.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a8",
          type: "likert",
          label:
            "Não finjo ter domínio total de um tema quando ainda estou em processo de aprendizado.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a9",
          type: "likert",
          label:
            "Gosto de admitir quando cometo erros didáticos ou de planejamento, pois acredito que a transparência reforça a confiança.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a10",
          type: "likert",
          label:
            "Considero que, ser sincero(a) quanto às dificuldades em implementar certa metodologia ou projeto ajuda todos a evoluir.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a11",
          type: "likert",
          label:
            "Sinto-me confortável para compartilhar incertezas ou pedir sugestões quando enfrento um desafio profissional.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a12",
          type: "likert",
          label:
            "Evito falar sobre minhas dificuldades no trabalho para não correr o risco de parecer despreparado(a).",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },

    // 4.4 Complacência
    {
      key: "complacencia",
      title: "4.3. Complacência",
      questions: [
        {
          id: "a13",
          type: "likert",
          label:
            "Procuro contornar conflitos desnecessários, cedendo em certos pontos para manter um bom clima nas minhas relações pessoais e profissionais.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a14",
          type: "likert",
          label:
            "Muitas vezes, aceito as decisões do colegiado mesmo que não sejam minhas preferidas, para evitar desavenças prolongadas.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a15",
          type: "likert",
          label:
            "Evito confrontos diretos em reuniões, pois acredito que o diálogo sereno produz melhores resultados.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a16",
          type: "likert",
          label:
            "Mantenho a calma e busco soluções conciliadoras quando surge alguma divergência sobre a distribuição de disciplinas.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a17",
          type: "likert",
          label:
            "Dou preferência a encontrar consensos rápidos, mesmo que isso exija abrir mão de parte das minhas propostas.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a18",
          type: "likert",
          label:
            "Tenho dificuldade em ceder em discussões, mesmo quando isso poderia encurtar conflitos e facilitar o andamento das decisões.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },

    // 4.6 Sensibilidade
    {
      key: "sensibilidade",
      title: "4.4. Sensibilidade",
      questions: [
        {
          id: "a19",
          type: "likert",
          label:
            "Sinto empatia por estudantes que enfrentam problemas de aprendizagem ou dificuldades pessoais.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a20",
          type: "likert",
          label:
            "Preocupo-me com o estado emocional de colegas que estão sobrecarregados com muitas disciplinas ou projetos.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a21",
          type: "likert",
          label:
            "Demonstro compreensão diante de limitações estruturais ou pessoais dos(as) discentes, tentando encontrar alternativas.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a22",
          type: "likert",
          label:
            "Sinto compaixão por quem não tem acesso aos mesmos recursos de ensino ou pesquisa que eu possuo.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a23",
          type: "likert",
          label:
            "Procuro oferecer apoio prático e emocional quando percebo que alguém está passando por um momento de fragilidade.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
        },
        {
          id: "a24",
          type: "likert",
          label:
            "Tenho dificuldade em perceber quando alguém ao meu redor está emocionalmente abalado ou precisando de ajuda.",
          required: true,
          minLabel: "Discordo Totalmente",
          maxLabel: "Concordo Totalmente",
          reverse: true,
        },
      ],
    },
  ],
};
