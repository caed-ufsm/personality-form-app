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
};
