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
  context?: string[];
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
    initial_prompt: string;
  };
  works_for: {
    name: string;
    description: string;
    site_url: string;
    tagline: string;
    metadata: Record<string, unknown>;
  };
  specification: {
    model: AllowedChatModels;
    version: string;
    none_fallback: boolean;
    hipaa_compliant: boolean;
  };
  security: {
    domain_whitelist: string[];
    allow_widgets: boolean;
  };
};

export type Context = Record<string, unknown>;

export type AdminRoles = "admin" | "superadmin";

export type OwnerTypes = "admin" | "organization";

export interface Notification {
  title: string;
  priority: "low" | "medium" | "high";
  body: string;
  actions: {
    title: string;
    type: string;
  }[];
  metadata: {
    [key: string]: unknown;
  };
  type: "organization_invitation";
}
