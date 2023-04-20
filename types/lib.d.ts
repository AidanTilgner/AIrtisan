export interface Button {
  type: string;
  metadata?: string;
}

export interface CorpusDataPoint {
  intent: string;
  utterances: string[];
  answers: string[];
  attachments: {
    buttons: Button[];
  };
  enhance?: boolean;
}

export interface Corpus {
  name: string;
  locale: string;
  data: CorpusDataPoint[];
}
