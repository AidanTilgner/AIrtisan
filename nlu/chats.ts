import { getNLUResponse } from ".";
import {
  addChatToConversationAndCreateIfNotExists,
  getChat,
  getChatByOrder,
  updateChat,
} from "../database/functions/conversations";
import { enhanceChatIfNecessary } from "./enhancement";
import { detectAndActivateTriggers } from "./triggers";

export const handleNewChat = async ({
  message,
  session_id,
  isTraining,
  allowTriggers,
}: {
  message: string;
  session_id: string;
  isTraining?: boolean;
  allowTriggers?: boolean;
}) => {
  try {
    const response = await getNLUResponse(message);
    const { intent, answer, confidence, initial_text } = response;
    if (allowTriggers) {
      detectAndActivateTriggers(intent, session_id);
    }
    const userChatResponse = await addChatToConversationAndCreateIfNotExists({
      sessionId: session_id,
      message,
      intent,
      role: "user",
      enhanced: false,
      training_copy: !!isTraining,
    });

    if (!userChatResponse) {
      return null;
    }

    const { chat: userChat } = userChatResponse;

    const { answer: botAnswer, enhanced } = await enhanceChatIfNecessary({
      message: initial_text,
      answer,
      intent,
      confidence,
      session_id,
    });

    const botChatResponse = await addChatToConversationAndCreateIfNotExists({
      sessionId: session_id,
      message: botAnswer,
      intent,
      role: "assistant",
      enhanced,
      confidence,
      training_copy: !!isTraining,
    });

    if (!botChatResponse) {
      return null;
    }

    const { chat: botChat, conversation } = botChatResponse;

    const chats = conversation?.chats;

    return {
      session_id,
      ...response,
      answer: botAnswer,
      chats,
      enhanced: enhanced || false,
      botChat: botChat?.id,
      userChat: userChat?.id,
      conversation: conversation,
      conversation_id: conversation?.id,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const handleRetryChat = async ({ chat_id }: { chat_id: number }) => {
  try {
    const chat = await getChat(chat_id);

    if (!chat) {
      return null;
    }

    const previousChat = await getChatByOrder(
      chat?.conversation.id,
      chat?.order - 1
    );

    if (!previousChat) {
      return null;
    }

    const textToRetry = previousChat?.message;

    if (!textToRetry) {
      return null;
    }

    const nluResponse = await getNLUResponse(textToRetry);

    const { intent, answer, confidence, initial_text } = nluResponse;
    const { answer: botAnswer, enhanced } = await enhanceChatIfNecessary({
      message: initial_text,
      answer,
      intent,
      confidence,
      session_id: chat?.conversation.session_id,
    });

    const userChatResponse = await updateChat(previousChat.id, {
      message: textToRetry,
      intent,
      enhanced: false,
    });

    const botChatResponse = await updateChat(chat.id, {
      message: botAnswer,
      intent,
      enhanced,
    });

    if (!botChatResponse) {
      return null;
    }

    const { chat: botChat, conversation } = botChatResponse;

    const chats = conversation?.chats;

    return {
      session_id: chat?.conversation.session_id,
      ...nluResponse,
      answer: botAnswer,
      chats,
      enhanced: enhanced || false,
      chat: botChat,
      botChat: botChat?.id,
      userChat: userChatResponse?.chat?.id,
      conversation: conversation,
      conversation_id: conversation?.id,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};
