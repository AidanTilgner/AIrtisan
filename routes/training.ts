import {
  addData,
  addOrUpdateUtteranceOnIntent,
  addResponseToIntent,
  addUtteranceToIntent,
  enhanceIntent,
  removeButtonFromIntentByType,
  removeResponseFromIntent,
  removeUtteranceFromIntent,
  updateButtonsOnIntent,
} from "../nlu/training";
import { Router } from "express";
import { retrain, getNLUResponse } from "../nlu";
import { getDataForIntent, getIntents, getAllButtons } from "../nlu/metadata";
import {
  getChatsThatNeedReview,
  getConversationsThatNeedReview,
  markChatAsReviewed,
} from "../database/functions/conversations";
import { checkIsAdmin } from "../middleware/auth";

const router = Router();

router.use(checkIsAdmin);

router.post("/say", async (req, res) => {
  const text = req.body.text || req.query.text;
  const response = await getNLUResponse(text);
  const intentData = getDataForIntent(response.intent);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain() : false;

  const toSend = {
    message: "Got response",
    success: true,
    retrained: retrained,
    data: { ...response, intent_data: intentData },
  };

  res.json(toSend);
});

router.post("/datapoint", async (req, res) => {
  try {
    const { data: newData } = await addData(req.body);
    const shouldRetrain = req.body.retrain || req.query.retrain;
    const retrained = shouldRetrain ? await retrain() : false;
    const toSend = {
      message: "Data added",
      data: newData,
      retrained,
      success: true,
    };
    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error adding data" });
  }
});

router.post("/retrain", async (req, res) => {
  try {
    const result = await retrain();
    const toSend = {
      message: "Retrained",
      data: result,
      success: true,
    };
    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error retraining" });
  }
});

router.get("/intent/:intent", async (req, res) => {
  const data = getDataForIntent(req.params.intent);
  const toSend = {
    message: "Data for intent",
    success: true,
    data,
  };

  res.send(toSend);
});

router.put("/intent", async (req, res) => {
  const { old_intent, new_intent, utterance } = req.body;
  const data = await addOrUpdateUtteranceOnIntent(
    old_intent,
    new_intent,
    utterance
  );

  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain() : false;

  const toSend = {
    message: "Intent updated",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.get("/intents", async (req, res) => {
  const intents = getIntents();
  const toSend = {
    message: "Got intents",
    success: true,
    data: intents,
  };
  res.send(toSend);
});

router.delete("/response", async (req, res) => {
  const { intent, answer } = req.body;
  const data = await removeResponseFromIntent(intent, answer);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain() : false;
  const toSend = {
    message: "Response removed",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.put("/response", async (req, res) => {
  const { intent, answer } = req.body;
  const data = await addResponseToIntent(intent, answer);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain() : false;
  const toSend = {
    message: "Responses added",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.delete("/utterance", async (req, res) => {
  const { intent, utterance } = req.body;
  const data = await removeUtteranceFromIntent(intent, utterance);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain() : false;
  const toSend = {
    message: "Utterance removed",
    success: true,
    data,
    retrained,
  };
  res.send(toSend);
});

router.put("/utterance", async (req, res) => {
  const { intent, utterance } = req.body;
  const data = await addUtteranceToIntent(intent, utterance);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain() : false;
  const toSend = {
    message: "Utterance added",
    success: true,
    data,
    retrained,
  };
  res.send(toSend);
});

router.put("/intent/:intent/enhance", async (req, res) => {
  const { intent } = req.params;
  const { enhance } = req.body as {
    enhance: boolean;
  };

  const data = enhanceIntent(intent, enhance);

  const shouldRetrain = req.body.retrain || req.query.retrain;

  const retrained = shouldRetrain ? await retrain() : false;

  const toSend = {
    message: "Intent enhanced",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.put("/intent/:intent/buttons", async (req, res) => {
  const { intent } = req.params;
  const { buttons } = req.body as {
    buttons: { type: string }[];
  };

  const data = updateButtonsOnIntent(intent, buttons);

  const shouldRetrain = req.body.retrain || req.query.retrain;

  const retrained = shouldRetrain ? await retrain() : false;

  const toSend = {
    message: "Intent buttons updated",
    success: true,
    data,
    retrained,
  };
});

router.delete("/intent/:intent/button", async (req, res) => {
  const { intent } = req.params;
  const { button } = req.body as {
    button: { type: string };
  };

  const data = removeButtonFromIntentByType(intent, button.type);

  const shouldRetrain = req.body.retrain || req.query.retrain;

  const retrained = shouldRetrain ? await retrain() : false;

  const toSend = {
    message: `Button with type ${button.type} removed from intent ${intent}`,
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.get("/buttons", async (req, res) => {
  const buttons = getAllButtons();

  const toSend = {
    message: "Got buttons",
    success: true,
    data: buttons,
  };

  res.send(toSend);
});

router.get("/chats/need_review", async (req, res) => {
  const data = await getChatsThatNeedReview();

  const toSend = {
    message: "Got need review",
    success: true,
    data,
  };

  res.send(toSend);
});

router.get("/conversations/need_review", async (req, res) => {
  const data = await getConversationsThatNeedReview();

  const toSend = {
    message: "Got need review",
    success: true,
    data,
  };

  res.send(toSend);
});

router.post("/chats/reviewed/:chat_id", async (req, res) => {
  const { chat_id } = req.params;
  const { username } = req.body;

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
