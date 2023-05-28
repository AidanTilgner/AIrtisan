import { Router } from "express";
import {
  checkIsAdmin,
  checkIsSuperAdmin,
  hasAccessToBot,
} from "../middleware/auth";
import {
  deleteConversation,
  getConversationsThatNeedReview,
  getConversations,
  getConversation,
  getBotConversations,
  generateIntentFlow,
  getRecentConversations,
} from "../database/functions/conversations";

const router = Router();

router.get("/", checkIsAdmin, hasAccessToBot, async (req, res) => {
  try {
    const { bot_id } = (req.query as { bot_id: string }) || req.body;

    if (!bot_id) {
      res.status(402).send({ message: "No bot id provided" });
      return;
    }

    const formattedBotId = Number(bot_id);

    const conversations = await getBotConversations(formattedBotId);

    res.send({
      message: "Conversations retrieved",
      success: true,
      data: conversations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting conversations" });
  }
});

router.get("/need_review", checkIsAdmin, hasAccessToBot, async (req, res) => {
  try {
    const { bot_id } = (req.query as { bot_id: string }) || req.body;

    if (!bot_id) {
      res.status(402).send({ message: "No bot id provided" });
      return;
    }

    const formattedBotId = Number(bot_id);

    const conversations = await getConversationsThatNeedReview(formattedBotId);

    res.send({
      message: "Conversations retrieved",
      success: true,
      data: conversations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting conversations" });
  }
});

router.get("/recent", checkIsAdmin, hasAccessToBot, async (req, res) => {
  try {
    const { bot_id } = (req.query as { bot_id: string }) || req.body;

    if (!bot_id) {
      res.status(402).send({ message: "No bot id provided" });
      return;
    }

    const formattedBotId = Number(bot_id);

    const conversations = await getRecentConversations(formattedBotId);

    res.send({
      message: "Conversations retrieved",
      success: true,
      data: conversations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting conversations" });
  }
});

router.get(
  "/recent/:number_of_recent",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const { bot_id } = (req.query as { bot_id: string }) || req.body;
      const { number_of_recent } = req.params;

      if (!bot_id) {
        res.status(402).send({ message: "No bot id provided" });
        return;
      }

      const formattedBotId = Number(bot_id);
      const formattedNumberOfRecent = Number(number_of_recent);

      const conversations = await getRecentConversations(
        formattedBotId,
        formattedNumberOfRecent
      );

      res.send({
        message: "Conversations retrieved",
        success: true,
        data: conversations,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error getting conversations" });
    }
  }
);

router.delete(
  "/:conversation_id",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const { conversation_id } = req.params;

      const formattedConversationId = Number(conversation_id);

      if (!formattedConversationId) {
        res.status(402).send({ message: "No conversation id provided" });
        return;
      }

      const conversation = await deleteConversation(formattedConversationId);

      if (!conversation) {
        res.status(404).send({ message: "Conversation not found" });
        return;
      }

      res.send({
        message: "Conversation deleted",
        success: true,
        data: conversation,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error deleting conversation" });
    }
  }
);

router.get(
  "/:conversation_id",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const { conversation_id } = req.params;

      const formattedConversationId = Number(conversation_id);

      if (!formattedConversationId) {
        res.status(402).send({ message: "No conversation id provided" });
        return;
      }

      const conversation = await getConversation(formattedConversationId);

      if (!conversation) {
        res.status(404).send({ message: "Conversation not found" });
        return;
      }

      res.send({
        message: "Conversation retrieved",
        success: true,
        data: conversation,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error getting conversation" });
    }
  }
);

router.get("/all", checkIsSuperAdmin, async (req, res) => {
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

router.get("/all/:conversation_id", checkIsSuperAdmin, async (req, res) => {
  try {
    const { conversation_id } = req.params;

    const formattedConversationId = Number(conversation_id);

    if (!formattedConversationId) {
      res.status(402).send({ message: "No conversation id provided" });
      return;
    }

    const conversation = await getConversation(formattedConversationId);

    if (!conversation) {
      res.status(404).send({ message: "Conversation not found" });
      return;
    }

    res.send({
      message: "Conversation retrieved",
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting conversation" });
  }
});

router.delete("/all/:conversation_id", checkIsSuperAdmin, async (req, res) => {
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

router.post(
  "/flow/:conversation_id/generate",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const { conversation_id } = req.params;

      if (!conversation_id) {
        res.status(402).send({ message: "No conversation id provided" });
        return;
      }

      const formattedConversationId = Number(conversation_id);

      const conversation = await generateIntentFlow(formattedConversationId);

      if (!conversation) {
        res.status(404).send({ message: "Conversation not found" });
        return;
      }

      res.send({
        message: "Conversation flow retrieved",
        success: true,
        data: conversation,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error getting conversation flow" });
    }
  }
);

export default router;
