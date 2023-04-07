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
import {
  enhanceChatIfNecessary,
  enhanceChatIfNecessaryWithGPT4All,
} from "../nlu/enhancement";
import { checkAPIKey } from "../middleware/auth";

config();
const router = Router();

router.use(logSession);
router.use(addIPToSession);
router.use(checkAPIKey);

router.post("/", async (req, res) => {
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
    const { chat: userChat } = await addChatToConversationAndCreateIfNotExists(
      session_id,
      message,
      intent,
      "user",
      false
    );

    const { answer: botAnswer, enhanced } = await enhanceChatIfNecessary({
      message: initial_text,
      answer,
      intent,
      confidence,
      session_id,
    });

    const { chat: botChat } = await addChatToConversationAndCreateIfNotExists(
      session_id,
      botAnswer,
      intent,
      "assistant",
      enhanced
    );

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

router.post("/:chat_id/should_review", async (req, res) => {
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

export default router;
