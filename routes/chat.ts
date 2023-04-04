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
} from "../database/functions/conversations";
import { enhanceChatIfNeccessary } from "../nlu/enhancement";

config();
const router = Router();

router.use(logSession);
router.use(addIPToSession);

router.post("/", async (req, res) => {
  const message = req.body.message || req.query.message;
  if (!message) {
    res.status(402).send({ message: "No message provided" });
    return;
  }
  const session_id = getRequesterSessionId(req) || createSession().id;

  const response = await getNLUResponse(message);
  const { intent, answer, confidence } = response;
  detectAndActivateTriggers(intent, session_id);
  await addChatToConversationAndCreateIfNotExists(
    session_id,
    message,
    intent,
    "user",
    false
  );

  const { answer: botAnswer, enhanced } = await enhanceChatIfNeccessary(
    answer,
    intent,
    confidence,
    session_id
  );

  await addChatToConversationAndCreateIfNotExists(
    session_id,
    botAnswer,
    intent,
    "assistant",
    enhanced
  );

  const chats = await getChatsFromSessionId(session_id);

  const toSend = {
    message,
    session_id,
    ...response,
    answer: botAnswer,
    chats,
    enhanced: enhanced || false,
  };

  res.send(toSend);
});

export default router;
