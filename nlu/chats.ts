import { getNLUResponse } from ".";
import { addChatToConversationAndCreateIfNotExists } from "../database/functions/conversations";
import { enhanceChatIfNecessary } from "./enhancement";
import { detectAndActivateTriggers } from "./triggers";

export const handleNewChat = async ({
  message,
  session_id,
  isTraining,
}: {
  message: string;
  session_id: string;
  isTraining?: boolean;
}) => {
  try {
    const response = await getNLUResponse(message);
    const { intent, answer, confidence, initial_text } = response;
    detectAndActivateTriggers(intent, session_id);
    const { chat: userChat } = await addChatToConversationAndCreateIfNotExists({
      sessionId: session_id,
      message,
      intent,
      role: "user",
      enhanced: false,
      training_copy: isTraining,
    });

    const { answer: botAnswer, enhanced } = await enhanceChatIfNecessary({
      message: initial_text,
      answer,
      intent,
      confidence,
      session_id,
    });

    const { chat: botChat, conversation } =
      await addChatToConversationAndCreateIfNotExists({
        sessionId: session_id,
        message: botAnswer,
        intent,
        role: "assistant",
        enhanced,
        confidence,
        training_copy: isTraining,
      });

    const chats = conversation.chats;

    return {
      session_id,
      ...response,
      answer: botAnswer,
      chats,
      enhanced: enhanced || false,
      botChat: botChat.id,
      userChat: userChat.id,
      conversation: conversation,
      conversation_id: conversation.id,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const handleRetryChat = async ({}: {}) => {
  try {
  } catch (err) {
    console.error(err);
    return null;
  }
};
