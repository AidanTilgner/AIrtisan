export interface Admin {
  id?: number | null;
  username: string;
  password?: string;
  role: "admin" | "superadmin";
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
    args: Record<string, any>;
    attachments: string[];
  }[];
  buttons?: {
    type: string;
    metadata?: Record<string, any>;
  }[];
  enhance: boolean;
}

export type CorpusData = CorpusDataPoint[];

export interface Corpus {
  name: string;
  locale: string;
  data: CorpusData;
}

export interface Bot {
  id?: number | null;
  name: string;
  description: string;
  bot_language: string;
  context_file: string;
  corpus_file: string;
  model_file: string;
  bot_version: string;
  enhancement_model: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ButtonType {
  type: string;
  metadata?: Record<string, any>;
}

export interface Manager {
  id: number;
  bot: any;
  running: boolean;
}
