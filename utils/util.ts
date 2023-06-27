import { Conversation } from "../database/models/conversation";

export const getConversationIntentFlow = (conversation: Conversation) => {
  const intentsFlow: string[] = [];

  conversation.chats
    .filter((c) => c.role === "assistant")
    .forEach((c) => {
      if (c.intent) {
        intentsFlow.push(c.intent);
      }
    });

  return intentsFlow;
};
