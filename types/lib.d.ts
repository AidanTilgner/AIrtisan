export type AllowedChatModels = "gpt-3.5-turbo" | "gpt-4";

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

export type Model = {
  personality: {
    name: string;
    description: string;
  };
  works_for: {
    name: string;
    description: string;
    site_url: string;
    tagline: string;
    metadata: {
      services: string[];
      location: string;
      founded: string;
      people: {
        name: string;
        role: string;
        contact: {
          email: string;
          phone: string;
        };
      }[];
    };
  };
  specification: { model: AllowedChatModels; version: string };
};

export type Context = Record<string, unknown>;

export type AdminRoles = "admin" | "superadmin";

export type OwnerTypes = "admin" | "organization";
