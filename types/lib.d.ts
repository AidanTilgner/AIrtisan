export interface Button {
  type: string;
  metadata?: string;
}

export interface CorpusDataPoint {
  intent: string;
  utterances: string[];
  answers: string[];
  buttons: Button[];
  enhance?: boolean;
}

export interface Corpus {
  name: string;
  locale: string;
  data: CorpusDataPoint[];
}

export type AdminRoles = "admin" | "superadmin";
