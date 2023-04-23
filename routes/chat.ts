import { Router } from "express";
import { addIPToSession, logSession } from "../middleware/analysis";
import { config } from "dotenv";
import { createSession } from "../sessions";
import { getRequesterSessionId } from "../utils/analysis";
import {
  markChatAsReviewed,
  markChatForReview,
} from "../database/functions/conversations";
import { checkAPIKey, checkIsAdmin, hasAccessToBot } from "../middleware/auth";
import { handleNewChat, handleRetryChat } from "../nlu/chats";
import { getManagerIsAlive } from "../nlu";

config();
const router = Router();

router.use(logSession);
router.use(addIPToSession);

router.post("/", checkAPIKey, async (req, res) => {
  try {
    const bot_id = req.body.bot_id || req.query.bot_id;

    if (!bot_id) {
      res.status(400).send({ message: "No bot id provided" });
      return;
    }

    const managerIsRunning = await getManagerIsAlive(Number(bot_id));

    if (!managerIsRunning) {
      res.status(200).send({
        message: "Bot manager is not running",
        data: {
          answer:
            "Sorry, but I'm not currently running. Please try again later.",
        },
      });
      return;
    }

    const message = req.body.message || req.query.message;
    if (!message) {
      res.status(400).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const newChatInfo = await handleNewChat({
      botId: Number(bot_id),
      message,
      session_id,
      allowTriggers: true,
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

router.post("/as_admin", checkIsAdmin, hasAccessToBot, async (req, res) => {
  try {
    const message = req.body.message || req.query.message;
    const bot_id = req.body.bot_id || req.query.bot_id;

    if (!bot_id || !message) {
      res.status(400).send({ message: "No bot id or message provided" });
      return;
    }

    const allowTriggers =
      !!req.body.allow_triggers || !!req.query.allow_triggers;
    if (!message) {
      res.status(400).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const newChatInfo = await handleNewChat({
      botId: Number(bot_id),
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
    const bot_id = req.body.bot_id || req.query.bot_id;
    if (!bot_id) {
      res.status(400).send({ message: "No bot_id provided" });
      return;
    }
    const message = req.body.message || req.query.message;
    if (!message) {
      res.status(400).send({ message: "No message provided" });
      return;
    }
    const session_id = getRequesterSessionId(req) || createSession().id;

    const newChatInfo = await handleNewChat({
      botId: Number(bot_id),
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

router.post("/as_admin/:chat_id/retry", checkIsAdmin, async (req, res) => {
  try {
    const { chat_id } = req.params;
    const { bot_id } = req.body;

    if (!bot_id) {
      res.status(400).send({ message: "No bot_id provided" });
      return;
    }

    const newChatInfo = await handleRetryChat({
      chat_id: Number(chat_id),
      bot_id: Number(bot_id),
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

router.post("/as_admin/:chat_id/reviewed", async (req, res) => {
  const { chat_id } = req.params;
  const { username } = req.body;

  if (!username) {
    res.status(400).send({
      message: "No username provided",
      success: false,
    });
    return;
  }

  const data = await markChatAsReviewed(Number(chat_id), username);

  if (!data) {
    res.send({
      message: "Chat not found",
      success: false,
    });
    return;
  }

  const toSend = {
    message: "Chat marked as reviewed",
    success: true,
    data,
  };

  res.send(toSend);
});

export default router;
