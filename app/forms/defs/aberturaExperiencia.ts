import type { FormDefinition } from "../lib/types";

export const aberturaExperienciaV1: FormDefinition = {
  id: "abertura-experiencia-v1",
  title: "Abertura à Experiência",
  storageVersion: 1,

  // --- metadados ---
  subtitle: "Imaginação, sentimentos, flexibilidade e valores",
  description:
    "Avalie sua criatividade, curiosidade intelectual e receptividade a novas ideias no contexto da UFSM.",
  iconEmoji: "🌌",
  themeColor: "#3b82f6",
  tags: ["Personalidade", "Docência", "Criatividade"],
  estimatedMinutes: 10,
  totalQuestions: 24,
  versionLabel: "v1",
  lastUpdatedISO: "2025-09-22",
  author: "Equipe de Produto",

  categories: [
    {
      key: "fantasia",
      title: "3.1. Fantasia",
      questions: [
        {
          id: "a1",
          type: "likert",
          label:
            "Costumo imaginar cenários futuros de sucesso, como ex-alunos(as) se destacando em suas carreiras ou aplicando meus ensinamentos.",
          required: true,
        },
        {
          id: "a2",
          type: "likert",
          label:
            "Crio histórias ou exemplos para tornar os conteúdos mais interessantes e facilitar a assimilação pelos(as) discentes.",
          required: true,
        },
        {
          id: "a3",
          type: "likert",
          label:
            "Ao planejar projetos de extensão ou pesquisa, imagino impactos positivos na comunidade ou avanços na área.",
          required: true,
        },
        {
          id: "a4",
          type: "likert",
          label:
            "Uso minha imaginação para visualizar melhorias no currículo ou na estrutura do curso, idealizando mudanças.",
          required: true,
        },
        {
          id: "a5",
          type: "likert",
          label:
            "Consigo transformar ideias abstratas em exemplos concretos para facilitar a compreensão de conceitos complexos.",
          required: true,
        },
        {
          id: "a6",
          type: "likert",
          label:
            "Tenho dificuldade em criar imagens mentais ou exemplos criativos para ilustrar o conteúdo que ensino ou pesquiso.",
          required: true,
          reverse: true,
        },
      ],
    },

    {
      key: "sentimentos",
      title: "3.3. Sentimentos",
      questions: [
        {
          id: "a7",
          type: "likert",
          label:
            "Presto atenção às minhas reações emocionais ao lidar com turmas mais desafiadoras ou dificuldades institucionais.",
          required: true,
        },
        {
          id: "a8",
          type: "likert",
          label:
            "Quando algum tema do meu componente curricular me afeta emocionalmente, procuro gerenciar essas emoções para que isso não prejudique a qualidade do meu ensino.",
          required: true,
        },
        {
          id: "a9",
          type: "likert",
          label:
            "Sou sensível a críticas sobre minhas práticas didáticas, e isso impacta meu ânimo.",
          required: true,
        },
        {
          id: "a10",
          type: "likert",
          label:
            "Costumo refletir sobre como minhas emoções podem ajudar ou atrapalhar na condução das atividades profissionais.",
          required: true,
        },
        {
          id: "a11",
          type: "likert",
          label:
            "Procuro desenvolver estratégias para que minhas emoções contribuam positivamente com o clima em sala de aula e com o relacionamento com os(as) discentes.",
          required: true,
        },
        {
          id: "a12",
          type: "likert",
          label:
            "Frequentemente deixo que minhas emoções interfiram de forma negativa nas minhas decisões e na condução das atividades docentes.",
          required: true,
          reverse: true,
        },
      ],
    },

    {
      key: "acoes_variadas",
      title: "3.4. Ações Variadas",
      questions: [
        {
          id: "a13",
          type: "likert",
          label:
            "Não hesito em testar metodologias ativas, jogos educativos ou diferentes ferramentas de avaliação.",
          required: true,
        },
        {
          id: "a14",
          type: "likert",
          label:
            "Gosto de explorar linhas de investigação além do que já domino, para ampliar meus horizontes.",
          required: true,
        },
        {
          id: "a15",
          type: "likert",
          label:
            "Sinto curiosidade em participar de formações pedagógicas, cursos de aperfeiçoamento ou eventos fora de minha área habitual.",
          required: true,
        },
        {
          id: "a16",
          type: "likert",
          label:
            "Estou disposto(a) a modificar minha rotina de trabalho se encontrar abordagens mais eficientes para dar conta das exigências docentes.",
          required: true,
        },
        {
          id: "a17",
          type: "likert",
          label:
            "Busco inspiração em práticas de outras áreas para adaptar e enriquecer minhas estratégias de ensino e pesquisa.",
          required: true,
        },
        {
          id: "a18",
          type: "likert",
          label:
            "Evito alterar métodos já consolidados, mesmo que novas práticas possam trazer melhorias.",
          required: true,
          reverse: true,
        },
      ],
    },

    {
      key: "valores",
      title: "3.6. Valores",
      questions: [
        {
          id: "a19",
          type: "likert",
          label:
            "Reflito sobre como minha docência pode impactar a transformação social, contribuindo para a comunidade.",
          required: true,
        },
        {
          id: "a20",
          type: "likert",
          label:
            "Sou aberto(a) a rever minhas convicções pedagógicas quando encontro evidências ou debates acadêmicos que as desafiem.",
          required: true,
        },
        {
          id: "a21",
          type: "likert",
          label:
            "Procuro compreender diferentes visões e correntes teóricas para apresentar maior diversidade de perspectivas aos(às) discentes.",
          required: true,
        },
        {
          id: "a22",
          type: "likert",
          label:
            "Valorizo a busca de conhecimento como forma de crescimento profissional, pessoal e social no âmbito da UFSM.",
          required: true,
        },
        {
          id: "a23",
          type: "likert",
          label:
            "Busco alinhar minhas práticas docentes a princípios éticos que fortaleçam a cidadania e o pensamento crítico dos(as) estudantes.",
          required: true,
        },
        {
          id: "a24",
          type: "likert",
          label:
            "Evito questionar meus próprios princípios ou métodos, mesmo quando surgem novas informações ou perspectivas.",
          required: true,
          reverse: true,
        },
      ],
    },
  ],
};
