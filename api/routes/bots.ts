import { Router } from "express";
import { checkAPIKeyForBot } from "../middleware/auth";
import { getBotBySlug } from "../../database/functions/bot";
import { Bot } from "../../database/models/bot";
import { getManagerIsAlive } from "../../nlu";
import { handleNewChat } from "../../nlu/chats";
import { getRequesterSessionId } from "../../utils/analysis";
import { createSession } from "../../sessions";
import { Logger } from "../../utils/logger";
import {
  validateAllowingWidgetsForBot,
  validateDomainForBot,
} from "../middleware/bot";
import { markChatForReview } from "../../database/functions/conversations";

const router = Router();

const botsLogger = new Logger({
  name: "Bots Router",
});

router.get("/", async (req, res) => {
  try {
    res.send({
      message: "Fetching all bots is not currently supported.",
    });
  } catch (error) {
    botsLogger.error("Error fetching all bots", error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
});

router.post(
  "/:bot_slug/public/chat",
  validateDomainForBot,
  validateAllowingWidgetsForBot,
  async (req, res) => {
    try {
      const bot = await getBotBySlug(req.params.bot_slug);

      if (!bot) {
        res
          .status(500)
          .send({ message: "There was an error identifying the bot." });
        return;
      }

      const managerIsRunning = await getManagerIsAlive(bot.id);

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
        botId: bot.id,
        message,
        session_id,
        allowTriggers: true,
      });

      if (!newChatInfo) {
        botsLogger.error(
          "Error getting response for chat",
          bot.id,
          message,
          `New chat info: ${JSON.stringify(newChatInfo)}`
        );
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
        message: "Chat processed successfully.",
        data: {
          ...newChatInfo,
        },
      };

      res.send(toSend);
    } catch (err) {
      botsLogger.error("Error handling chat", err);
      res.status(500).send({
        message: "Error getting response",
        answer:
          "Sorry, I've encountered an error. It has been reported. Please try again later.",
      });
    }
  }
);

router.get("/:bot_slug", checkAPIKeyForBot, async (req, res) => {
  try {
    const bot = await getBotBySlug(req.params.bot_slug);

    if (!bot) {
      res.status(404).send({ message: "Bot not found." });
      return;
    }

    res.status(200).send({
      message: "Bot fetched successfully.",
      data: bot,
    });
  } catch (error) {
    botsLogger.error("Error fetching bot", error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
});

router.post("/:bot_slug/chat", checkAPIKeyForBot, async (req, res) => {
  try {
    const bot = (req as unknown as Record<"bot", Bot>)["bot"];

    if (!bot) {
      res
        .status(500)
        .send({ message: "There was an error identifying the bot." });
      return;
    }

    const managerIsRunning = await getManagerIsAlive(bot.id);

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
      botId: bot.id,
      message,
      session_id,
      allowTriggers: true,
    });

    if (!newChatInfo) {
      botsLogger.error(
        "Error getting response for chat",
        bot.id,
        message,
        `New chat info: ${JSON.stringify(newChatInfo)}`
      );
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
      message: "Chat processed successfully.",
      data: {
        ...newChatInfo,
      },
    };

    res.send(toSend);
  } catch (err) {
    botsLogger.error("Error handling chat", err);
    res.status(500).send({
      message: "Error getting response",
      answer:
        "Sorry, I've encountered an error. It has been reported. Please try again later.",
    });
  }
});

router.post(
  "/:bot_slug/chat/:chat_id/should_review",
  checkAPIKeyForBot,
  async (req, res) => {
    try {
      const bot = (req as unknown as Record<"bot", Bot>)["bot"];

      if (!bot) {
        res
          .status(500)
          .send({ message: "There was an error identifying the bot." });
        return;
      }

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

export default router;
