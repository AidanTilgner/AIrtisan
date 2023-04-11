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
  created_at: Date;
  updated_at: Date;
}

export interface ConversationToReview extends Conversation {
  chats_to_review: Chat[];
}
