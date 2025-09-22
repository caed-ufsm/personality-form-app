export type LikertScale = 3 | 5 | 7;

export type LikertQuestion = {
  id: string;                // estável para storage/analytics
  type: "likert";
  label: string;
  required?: boolean;
  scale?: LikertScale;       // default = 5
  minLabel?: string;         // default = "Discordo totalmente"
  maxLabel?: string;         // default = "Concordo totalmente"
  help?: string;
  reverse?: boolean;         // default = false
};

export type Category = {
  key: string;
  title: string;
  questions: LikertQuestion[];
};

export type FormDefinition = {
  id: string;                // ex: "personality-v1"
  title: string;
  storageVersion?: number;   // para invalidar rascunho antigo
  categories: Category[];

  // --- novos campos para UI/listagem ---
  subtitle?: string;         // linha auxiliar sob o título
  description?: string;      // texto curto pro card
  iconEmoji?: string;        // ícone simples (ex: "🧠", "💬")
  themeColor?: string;       // cor principal (hex ou tailwind token)
  coverImageUrl?: string;    // opcional: imagem de capa do card
  tags?: string[];           // badges (ex: ["UX", "Pesquisa"])
  estimatedMinutes?: number; // tempo médio para completar
  totalQuestions?: number;   // nº de perguntas (pré-calculado)
  versionLabel?: string;     // ex: "v1"
  lastUpdatedISO?: string;   // data de última atualização (ISO string)
  author?: string;           // responsável pelo formulário
};