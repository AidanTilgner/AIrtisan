export type AdminRoles = "admin" | "superadmin";
export type OwnerTypes = "organization" | "admin";
export type AllowedChatModels = "gpt-3.5-turbo" | "gpt-4";

export interface Admin {
  id?: number | null;
  username: string;
  display_name: string;
  password?: string;
  role: AdminRoles;
  email: string;
  profile_picture_path: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApiKey {
  id?: number | null;
  key: string;
  for: string;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id?: number | null;
  generated_name: string;
  session_id: string;
  chats: Chat[];
  training_copy: boolean;
  intents_graph: string;
  created_at: Date;
  updated_at: Date;
}

export interface Chat {
  id?: number | null;
  session_id: string;
  message: string;
  intent: string;
  confidence: number | null;
  role: "user" | "assistant";
  enhanced: boolean;
  needs_review: boolean;
  review_text: string | null;
  reviewer: string | null;
  conversation: Conversation;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationToReview extends Conversation {
  chats_to_review: Chat[];
}

export interface CorpusDataPoint {
  intent: string;
  utterances: string[];
  answers: string[];
  triggers?: {
    type: string;
    args: Record<string, unknown>;
    attachments: string[];
  }[];
  buttons?: ButtonType[];
  enhance: boolean;
  context?: string[];
}

export type CorpusData = CorpusDataPoint[];

export interface Corpus {
  name: string;
  locale: string;
  data: CorpusData;
}

export type Context = Record<string, string>;

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

export interface Bot {
  id?: number | null;
  name: string;
  description: string;
  bot_language: string;
  context_file: string;
  corpus_file: string;
  model_file: string;
  bot_version: string;
  owner_id: number;
  owner_type: OwnerTypes;
  is_running: boolean | null;
  owner?: Organization | Admin;
  enhancement_model: string;
  slug: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ButtonType {
  type: string;
  metadata?: Record<string, unknown>;
}

export interface Manager {
  id: number;
  bot: unknown;
  running: boolean;
}

export interface Organization {
  id?: number | null;
  name: string;
  description: string;
  owner: Admin;
  admins: Admin[];
  bots: Bot[];
  profile_picture_path: string;
  created_at: Date;
  updated_at: Date;
}

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
  type: "organization_invite";
}

export interface OrganizationInvitation {
  id?: number | null;
  organization: Organization;
  admin: Admin;
  token: string;
  accepted: boolean;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Feedback {
  id?: number | null;
  feedback: string;
  type: "feedback" | "bug" | "feature";
  admin: Admin;
  reviewer: string;
  review_message: string;
  created_at: Date;
  updated_at: Date;
}
