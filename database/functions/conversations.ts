import { getGeneratedNameBasedOnContent } from "../../nlu/utils";
import { entities, dataSource } from "../index";
import { Chat, ChatRole } from "../models/chat";
import { Conversation } from "../models/conversation";

export const getConversations = async () => {
  try {
    const conversations = await dataSource.manager.find(entities.Conversation);
    return conversations;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getConversation = async (conversationId: number) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { id: conversationId },
      }
    );
    return conversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createConversationFromSessionId = async (
  sessionId: string,
  training_copy: boolean
) => {
  try {
    const conversation = new entities.Conversation();
    conversation.session_id = sessionId;
    conversation.training_copy = training_copy;
    await dataSource.manager.save(conversation);
    return conversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getConversationFromSessionId = async (
  sessionId: string,
  training_copy: boolean
) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { session_id: sessionId, training_copy },
        relations: ["chats"],
      }
    );

    if (!conversation) {
      return null;
    }

    return conversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createChatInConversation = async ({
  sessionId,
  message,
  intent,
  role,
  enhanced,
  confidence,
  conversation,
}: {
  sessionId: string;
  message: string;
  intent: string;
  role: ChatRole;
  enhanced: boolean;
  conversation: Conversation;
  confidence?: number;
}) => {
  try {
    if (!conversation) {
      console.error(
        "Could not create chat because conversation was not provided"
      );
      return null;
    }

    const chatLength = conversation?.chats?.length;

    const chat = new entities.Chat();
    chat.session_id = sessionId;
    chat.message = message;
    chat.intent = intent;
    chat.role = role;
    chat.enhanced = enhanced;
    chat.order = chatLength + 1 || 1;

    if (confidence) {
      chat.confidence = confidence;
    }

    await dataSource.manager.save(chat);

    conversation.chats = [...(conversation.chats || []), chat];
    await dataSource.manager.save(conversation);
    return {
      chat,
      conversation,
    };
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

export const createConversationIfNotExists = async (
  sessionId: string,
  training_copy: boolean
) => {
  try {
    const conversation = await getConversationFromSessionId(
      sessionId,
      training_copy
    );

    if (!conversation) {
      return await createConversationFromSessionId(sessionId, training_copy);
    }

    const lengthMapper: {
      [key: number]: boolean;
    } = {
      2: true,
      6: true,
      10: true,
    };

    if (conversation?.chats.length && lengthMapper[conversation.chats.length]) {
      const newName =
        (
          await getGeneratedNameBasedOnContent(
            conversation.chats.map((chat) => ({
              message: chat.message,
              role: chat.role,
            }))
          )
        )?.trim() || "Unnamed Conversation";
      conversation.generated_name = newName;
      await dataSource.manager.save(conversation);
    }

    return conversation;
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
  training_copy,
}: {
  sessionId: string;
  message: string;
  intent: string;
  role: ChatRole;
  enhanced: boolean;
  confidence?: number;
  training_copy?: boolean;
}) => {
  try {
    const conversation = await createConversationIfNotExists(
      sessionId,
      !!training_copy
    );

    if (!conversation) {
      return null;
    }

    const newChatData = await createChatInConversation({
      sessionId,
      message,
      intent,
      role,
      enhanced,
      confidence,
      conversation,
    });

    if (!newChatData) {
      return null;
    }

    const { conversation: newConversation, chat: newChat } = newChatData;

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
    if (!chats) {
      return null;
    }
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

export const createTrainingCopyOfConversation = async (
  conversationId: number
) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { id: conversationId },
        relations: ["chats"],
      }
    );

    if (!conversation) {
      return null;
    }

    const newConversation = new entities.Conversation();
    newConversation.session_id = conversation.session_id;
    newConversation.generated_name = `Copy of: ${
      conversation.generated_name || "Unnamed Conversation"
    }`;
    newConversation.training_copy = true;
    await dataSource.manager.save(newConversation);

    for (const chat of conversation.chats) {
      const newChat = new entities.Chat();
      newChat.session_id = chat.session_id;
      newChat.message = chat.message;
      newChat.intent = chat.intent;
      newChat.role = chat.role;
      newChat.enhanced = chat.enhanced;
      newChat.conversation = newConversation;
      newChat.order = chat.order;
      newChat.confidence = chat.confidence;
      newChat.needs_review = chat.needs_review;
      await dataSource.manager.save(newChat);
    }
    return newConversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteConversation = async (conversationId: number) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { id: conversationId },
        relations: ["chats"],
      }
    );

    if (!conversation) {
      return null;
    }

    for (const chat of conversation.chats) {
      await dataSource.manager.remove(chat);
    }
    await dataSource.manager.remove(conversation);
    return conversation;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getChat = async (chatId: number) => {
  try {
    const chat = await dataSource.manager.findOne(entities.Chat, {
      where: { id: chatId },
      relations: ["conversation"],
    });
    return chat;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getChatByOrder = async (conversationId: number, order: number) => {
  try {
    const conversation = await dataSource.manager.findOne(
      entities.Conversation,
      {
        where: { id: conversationId },
        relations: ["chats"],
      }
    );

    if (!conversation) {
      return null;
    }

    const chat = conversation.chats.find((chat) => chat.order === order);

    return chat;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateChat = async (chatId: number, data: Partial<Chat>) => {
  try {
    const chat = await dataSource.manager.findOne(entities.Chat, {
      where: { id: chatId },
      relations: ["conversation"],
    });

    if (!chat) {
      return null;
    }

    Object.assign(chat, data);
    await dataSource.manager.save(chat);
    await dataSource.manager.save(chat.conversation);
    return {
      chat: chat,
      conversation: chat.conversation,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};
