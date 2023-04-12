import {
  Chat,
  Conversation,
  ConversationToReview,
} from "../../../documentation/main";
import { api } from "./index";
import { showNotification } from "@mantine/notifications";

export const getChatsThatNeedReview = async () => {
  try {
    const res = await api.get("/training/chats/need_review");
    return res.data.data;
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error getting chats that need review.",
      color: "red",
    });
  }
};

export const getConversationsThatNeedReview = async () => {
  try {
    const res = await api.get("/conversations/need_review");
    return {
      success: true,
      conversations: res.data.data.conversations as ConversationToReview[],
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error getting conversations that need review.",
      color: "red",
    });
    return {
      success: false,
      conversations: [],
    };
  }
};

export const markChatAsReviewed = async (chatId: number, username: string) => {
  try {
    const res = await api.post(`/training/chats/reviewed/${chatId}`, {
      username,
    });
    return res.data.data;
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error marking the chat as reviewed.",
      color: "red",
    });
  }
};

export const getConversations = async () => {
  try {
    const res = await api.get("/conversations/all");
    return {
      success: true,
      conversations: res.data.data.conversations as Conversation[],
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error getting conversations.",
      color: "red",
    });
    return {
      success: false,
      conversations: [],
    };
  }
};

export const createTrainingCopyOfConversation = async (
  conversation_id: string | number
) => {
  try {
    const res = await api.post(
      `/training/conversation/${conversation_id}/training_copy`
    );
    return {
      success: true,
      conversation: res.data.data.conversation as Conversation,
      new_conversation_id: res.data.data.new_conversation_id as number,
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message:
        "There was an error creating a training copy of the conversation.",
      color: "red",
    });
    return {
      success: false,
      conversation: null,
      new_conversation_id: null,
    };
  }
};

export const deleteConversation = async (conversation_id: string | number) => {
  try {
    const res = await api.delete(`/conversations/${conversation_id}`);
    return {
      success: true,
      conversation: res.data.data.conversation as Conversation,
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error deleting the conversation.",
      color: "red",
    });
    return {
      success: false,
      conversation: null,
    };
  }
};

export const getConversation = async (conversation_id: string | number) => {
  try {
    const res = await api.get(`/conversations/${conversation_id}`);
    return {
      success: true,
      conversation: res.data.data.conversation as Conversation,
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error getting the conversation.",
      color: "red",
    });
    return {
      success: false,
      conversation: null,
    };
  }
};

export const postTrainingChat = async (chat: {
  message: string;
  session_id: string;
}) => {
  try {
    const res = await api.post("/chat/as_admin/training", {
      message: chat.message,
      session_id: chat.session_id,
    });
    return {
      ...(res.data.data as Record<string, unknown>),
      success: true,
      conversation: res.data.data.conversation as Conversation,
      conversation_id: res.data.data.conversation_id as number,
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error posting the training chat.",
      color: "red",
    });
    return {
      success: false,
      conversation: null,
      conversation_id: null,
    };
  }
};

export const retryChat = async (chatId: number) => {
  try {
    const res = await api.post(`/training/chats/retry/${chatId}`);
    return {
      success: true,
      chat: res.data.data.chat as Chat,
      answer: res.data.data.answer as string,
      conversation: res.data.data.conversation as Conversation,
    };
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error retrying the chat.",
      color: "red",
    });
    return {
      success: false,
      chat: null,
      answer: null,
      conversation: null,
    };
  }
};
