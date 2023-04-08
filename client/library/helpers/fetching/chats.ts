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
    const res = await api.get("/training/conversations/need_review");
    return res.data.data;
  } catch (err) {
    console.error(err);
    showNotification({
      title: "Error",
      message: "There was an error getting conversations that need review.",
      color: "red",
    });
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
