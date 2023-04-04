import { entities, dataSource } from "../index";
import { ChatRole } from "../models/chat";

export const getConversations = async () => {
  const conversations = await dataSource.manager.find(entities.Conversation);
  return conversations;
};

export const createConversationFromSessionId = async (sessionId: string) => {
  try {
    const conversation = new entities.Conversation();
    conversation.session_id = sessionId;
    await dataSource.manager.save(conversation);
    return conversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getConversationFromSessionId = async (sessionId: string) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { session_id: sessionId },
      }
    );
    return conversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createChatFromSessionId = async (
  sessionId: string,
  message: string,
  intent: string,
  role: ChatRole,
  enhanced: boolean
) => {
  try {
    const conversation = await getConversationFromSessionId(sessionId);

    if (!conversation) {
      return null;
    }

    const chat = new entities.Chat();
    chat.session_id = sessionId;
    chat.message = message;
    chat.intent = intent;
    chat.role = role;
    chat.enhanced = enhanced;
    chat.conversation = conversation;
    await dataSource.manager.save(chat);
    return chat;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getChatsFromSessionId = async (sessionId: string) => {
  try {
    const chats = await dataSource.manager.find(entities.Chat, {
      where: { session_id: sessionId },
    });
    return chats;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getConversationChatsFromSessionId = async (sessionId: string) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { session_id: sessionId },
        relations: ["chats"],
      }
    );

    if (!conversation) {
      return null;
    }

    return conversation.chats;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createConversationIfNotExists = async (sessionId: string) => {
  try {
    const conversation = await getConversationFromSessionId(sessionId);

    if (!conversation) {
      await createConversationFromSessionId(sessionId);
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addChatToConversationAndCreateIfNotExists = async (
  sessionId: string,
  message: string,
  intent: string,
  role: ChatRole,
  enhanced: boolean
) => {
  try {
    await createConversationIfNotExists(sessionId);
    await createChatFromSessionId(sessionId, message, intent, role, enhanced);
    const newConversation = await getConversationFromSessionId(sessionId);
    return newConversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};
