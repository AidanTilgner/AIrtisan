import { Router } from "express";
import { checkIsAdmin } from "../middleware/auth";
import {
  deleteConversation,
  getConversationsThatNeedReview,
  getConversations,
} from "../database/functions/conversations";

const router = Router();

router.use(checkIsAdmin);

router.get("/need_review", async (req, res) => {
  try {
    const conversations = await getConversationsThatNeedReview();

    res.send({
      message: "Conversations retrieved",
      success: true,
      data: {
        conversations,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting conversations" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const conversations = await getConversations();

    res.send({
      message: "Conversations retrieved",
      success: true,
      data: {
        conversations,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting conversations" });
  }
});

router.delete("/:conversation_id", async (req, res) => {
  try {
    const { conversation_id } = req.params;

    const formattedConversationId = Number(conversation_id);

    if (!formattedConversationId) {
      res.status(402).send({ message: "No conversation id provided" });
      return;
    }

    const result = await deleteConversation(formattedConversationId);

    if (!result) {
      res.status(404).send({ message: "Conversation not found" });
      return;
    }

    res.send({
      message: "Conversation deleted",
      success: true,
      data: {
        conversation: result,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error deleting conversation" });
  }
});

export default router;
