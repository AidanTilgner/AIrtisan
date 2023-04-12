import { Router } from "express";
import { addIPToSession, logSession } from "../middleware/analysis";
import { config } from "dotenv";
import { createSession } from "../sessions";
import { getRequesterSessionId } from "../utils/analysis";
import { markChatForReview } from "../database/functions/conversations";
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
      allowTriggers: true,
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
    const allowTriggers =
      !!req.body.allow_triggers || !!req.query.allow_triggers;
    if (!message) {
      res.status(402).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const newChatInfo = await handleNewChat({
      message,
      session_id,
      allowTriggers,
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

    const newChatInfo = await handleNewChat({
      message,
      session_id,
      isTraining: true,
    });

    if (!newChatInfo) {
      res.status(500).send({
        message: "Error getting response",
        data: {
          answer:
            "Sorry, I've encountered an error. It has been reported. Please try again later.",
        },
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

export default router;
