import { Router } from "express";
import { getNLUResponse } from "../nlu";
import { addIPToSession, logSession } from "../middleware/analysis";
import { detectAndActivateTriggers } from "../nlu/triggers";
import { config } from "dotenv";
import { createSession } from "../sessions";
import { getRequesterSessionId } from "../utils/analysis";
import {
  addChatToConversationAndCreateIfNotExists,
  getChatsFromSessionId,
  markChatForReview,
} from "../database/functions/conversations";
import { enhanceChatIfNecessary } from "../nlu/enhancement";
import { checkAPIKey, checkIsAdmin } from "../middleware/auth";
import { handleNewChat } from "../nlu/chats";

config();
const router = Router();

router.use(logSession);
router.use(addIPToSession);

router.post("/", checkAPIKey, async (req, res) => {
  try {
    const message = req.body.message || req.query.message;
    if (!message) {
      res.status(402).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const newChatInfo = await handleNewChat({
      message,
      session_id,
    });

    if (!newChatInfo) {
      res.status(500).send({
        message: "Error getting response",
        answer:
          "Sorry, I've encountered an error. It has been reported. Please try again later.",
      });
      return;
    }

    const toSend = {
      message,
      data: {
        ...newChatInfo,
      },
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Error getting response",
      answer:
        "Sorry, I've encountered an error. It has been reported. Please try again later.",
    });
  }
});

router.post("/:chat_id/should_review", checkAPIKey, async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { review_message } = req.body;

    const marked = await markChatForReview(Number(chat_id), review_message);

    if (!marked) {
      res.status(404).send({ message: "Chat not found" });
      return;
    }

    res.send({ message: "Chat marked for review", data: marked });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error updating chat" });
  }
});

router.post("/as_admin", checkIsAdmin, async (req, res) => {
  try {
    const message = req.body.message || req.query.message;
    if (!message) {
      res.status(402).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const newChatInfo = await handleNewChat({
      message,
      session_id,
    });

    if (!newChatInfo) {
      res.status(500).send({
        message: "Error getting response",
        answer:
          "Sorry, I've encountered an error. It has been reported. Please try again later.",
      });
      return;
    }

    const toSend = {
      message,
      data: {
        ...newChatInfo,
      },
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Error getting response",
      answer:
        "Sorry, I've encountered an error. It has been reported. Please try again later.",
    });
  }
});

router.post(
  "/as_admin/:chat_id/should_review",
  checkIsAdmin,
  async (req, res) => {
    try {
      const { chat_id } = req.params;
      const { review_message } = req.body;

      const marked = await markChatForReview(Number(chat_id), review_message);

      if (!marked) {
        res.status(404).send({ message: "Chat not found" });
        return;
      }

      res.send({ message: "Chat marked for review", data: marked });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error updating chat" });
    }
  }
);

router.post("/as_admin/training", checkIsAdmin, async (req, res) => {
  try {
    const message = req.body.message || req.query.message;
    if (!message) {
      res.status(402).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const response = await getNLUResponse(message);
    const { intent, answer, confidence, initial_text } = response;
    detectAndActivateTriggers(intent, session_id);
    const { chat: userChat } = await addChatToConversationAndCreateIfNotExists({
      sessionId: session_id,
      message,
      intent,
      role: "user",
      enhanced: false,
      training_copy: true,
    });

    const { answer: botAnswer, enhanced } = await enhanceChatIfNecessary({
      message: initial_text,
      answer,
      intent,
      confidence,
      session_id,
    });

    const { chat: botChat, conversation } =
      await addChatToConversationAndCreateIfNotExists({
        sessionId: session_id,
        message: botAnswer,
        intent,
        role: "assistant",
        enhanced,
        confidence,
        training_copy: true,
      });

    const chats = await getChatsFromSessionId(session_id);

    const toSend = {
      message,
      data: {
        session_id,
        ...response,
        answer: botAnswer,
        chats,
        enhanced: enhanced || false,
        botChat: botChat.id,
        userChat: userChat.id,
        conversation: conversation,
        conversation_id: conversation.id,
      },
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Error getting response",
      answer:
        "Sorry, I've encountered an error. It has been reported. Please try again later.",
    });
  }
});

export default router;
