import {
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
