import { api } from "./index";
import { showNotification } from "@mantine/notifications";

export const getChatsThatNeedReview = async () => {
  try {
    const res = await api.get("/training/chats/need_review");
    return res.data.data;
  } catch (err) {
    console.log(err);
    showNotification({
      title: "Error",
      message: "There was an error getting chats that need review.",
      color: "red",
    });
  }
};
