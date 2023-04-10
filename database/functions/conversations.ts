import { getGeneratedNameBasedOnContent } from "../../nlu/utils";
import { entities, dataSource } from "../index";
import { ChatRole } from "../models/chat";
import { Conversation } from "../models/conversation";

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

export const createChatFromSessionId = async ({
  sessionId,
  message,
  intent,
  role,
  enhanced,
  confidence,
}: {
  sessionId: string;
  message: string;
  intent: string;
  role: ChatRole;
  enhanced: boolean;
  confidence?: number;
}) => {
  try {
    const conversation = await getConversationFromSessionId(sessionId);

    if (!conversation) {
      return null;
    }

    const chatLength = conversation.chats.length;

    const chat = new entities.Chat();
    chat.session_id = sessionId;
    chat.message = message;
    chat.intent = intent;
    chat.role = role;
    chat.enhanced = enhanced;
    chat.conversation = conversation;
    chat.order = chatLength + 1;
    if (confidence) {
      chat.confidence = confidence;
    }
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

    const lengthMapper = {
      2: true,
      6: true,
      10: true,
    };

    if (lengthMapper[conversation?.chats.length]) {
      const newName = await getGeneratedNameBasedOnContent(
        conversation.chats.map((chat) => ({
          message: chat.message,
          role: chat.role,
        }))
      );
      conversation.generated_name = newName;
      await dataSource.manager.save(conversation);
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addChatToConversationAndCreateIfNotExists = async ({
  sessionId,
  message,
  intent,
  role,
  enhanced,
  confidence,
}: {
  sessionId: string;
  message: string;
  intent: string;
  role: ChatRole;
  enhanced: boolean;
  confidence?: number;
}) => {
  try {
    await createConversationIfNotExists(sessionId);
    const newChat = await createChatFromSessionId({
      sessionId,
      message,
      intent,
      role,
      enhanced,
      confidence,
    });
    const newConversation = await getConversationFromSessionId(sessionId);
    return {
      conversation: newConversation,
      chat: newChat,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const markChatForReview = async (chatId: number, reviewText: string) => {
  try {
    const chat = await dataSource.manager.findOne(entities.Chat, {
      where: { id: chatId },
    });

    if (!chat) {
      return null;
    }

    chat.needs_review = true;
    chat.review_text = reviewText;
    await dataSource.manager.save(chat);
    return chat;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getChatsThatNeedReview = async () => {
  try {
    const chats = await dataSource.manager.find(entities.Chat, {
      where: { needs_review: true },
      relations: ["conversation"],
    });
    return chats;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getConversationsThatNeedReview = async () => {
  try {
    const chats = await getChatsThatNeedReview();
    const ids = chats.map((chat) => chat.conversation.id);
    const filteredIds = ids.filter((id, index) => {
      return ids.indexOf(id) === index;
    });
    const conversations: Conversation[] = [];
    for (const id of filteredIds) {
      const conversation = await dataSource.manager.findOne(
        entities.Conversation,
        {
          where: { id: id },
          relations: ["chats"],
        }
      );
      if (conversation) {
        const conversationWithNeededReview = {
          ...conversation,
          chats_to_review: conversation.chats.filter(
            (chat) => chat.needs_review
          ),
        };
        conversations.push(conversationWithNeededReview);
      }
    }

    return conversations;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const markChatAsReviewed = async (chatId: number, username: string) => {
  try {
    const chat = await dataSource.manager.findOne(entities.Chat, {
      where: { id: chatId },
    });

    if (!chat) {
      return null;
    }

    chat.needs_review = false;
    chat.reviewer = username;
    await dataSource.manager.save(chat);
    return chat;
  } catch (err) {
    console.error(err);
    return null;
  }
};
