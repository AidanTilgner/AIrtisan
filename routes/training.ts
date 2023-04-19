import {
  addData,
  addOrUpdateUtteranceOnIntent,
  addResponseToIntent,
  addUtteranceToIntent,
  deleteDataPoint,
  enhanceIntent,
  removeButtonFromIntentByType,
  removeResponseFromIntent,
  removeUtteranceFromIntent,
  renameIntent,
  updateButtonsOnIntent,
} from "../nlu/training";
import { Router } from "express";
import { retrain, getNLUResponse } from "../nlu";
import {
  getDataForIntent,
  getIntents,
  getIntentsFull,
  getDefaultCorpus,
  getButtons,
} from "../nlu/metadata";
import {
  getChatsThatNeedReview,
  getConversationsThatNeedReview,
  markChatAsReviewed,
  getConversations,
  createTrainingCopyOfConversation,
} from "../database/functions/conversations";
import { checkIsAdmin } from "../middleware/auth";
import { handleRetryChat } from "../nlu/chats";

const router = Router();

router.use(checkIsAdmin);

router.post("/say", async (req, res) => {
  const text = req.body.text || req.query.text;
  const botId = req.body.bot_id || req.query.bot_id;
  if (!text || !botId) {
    res.status(400).send({ message: "Missing text or botId." });
    return;
  }
  const response = await getNLUResponse(Number(botId), text);
  if (!response) {
    res.status(500).send({ message: "Error getting response" });
    return;
  }
  const intentData = await getDataForIntent(Number(botId), response.intent);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain(botId) : false;

  const toSend = {
    message: "Got response",
    success: true,
    retrained: retrained,
    data: { ...response, intent_data: intentData },
  };

  res.json(toSend);
});

router.get("/corpus/default", async (req, res) => {
  try {
    const botId = req.query.bot_id;
    if (!botId) {
      res.status(400).send({ message: "Missing botId." });
      return;
    }
    const corpus = await getDefaultCorpus(Number(botId));
    const toSend = {
      message: "Got default corpus",
      success: true,
      data: corpus,
    };
    res.json(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting default corpus" });
  }
});

router.post("/datapoint", async (req, res) => {
  try {
    const body = req.body;
    const { bot_id, ...rest } = body;
    const data = await addData({
      id: Number(bot_id),
      ...rest,
    });
    if (!data) {
      res.status(500).send({ message: "Error adding data" });
      return;
    }

    const newData = data.data;

    const shouldRetrain = req.body.retrain || req.query.retrain;
    const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;
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

router.delete("/datapoint", async (req, res) => {
  try {
    const { intent, bot_id } = req.body;

    if (!intent || !bot_id) {
      res.status(400).send({ message: "Missing intent or bot_id." });
      return;
    }

    const { data: newData } = await deleteDataPoint(Number(bot_id), intent);
    const shouldRetrain = req.body.retrain || req.query.retrain;
    const retrained = shouldRetrain ? await retrain(bot_id) : false;

    const toSend = {
      message: "Data removed",
      data: newData,
      retrained,
      success: true,
    };
    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error removing data" });
  }
});

router.post("/retrain", async (req, res) => {
  try {
    const botId = req.body.bot_id || req.query.bot_id;
    const result = await retrain(Number(botId));
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
  try {
    const botId = req.query.bot_id;
    const intent = req.params.intent;
    const data = await getDataForIntent(Number(botId), intent);
    const toSend = {
      message: "Data for intent",
      success: true,
      data,
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting data for intent" });
  }
});

router.put("/intent", async (req, res) => {
  try {
    const { old_intent, new_intent, utterance, bot_id } = req.body;
    const data = await addOrUpdateUtteranceOnIntent(
      Number(bot_id),
      old_intent,
      new_intent,
      utterance
    );

    const shouldRetrain = req.body.retrain || req.query.retrain;
    const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

    const toSend = {
      message: "Intent updated",
      success: true,
      data,
      retrained,
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error updating intent" });
  }
});

router.put("/intent/rename", async (req, res) => {
  try {
    const { bot_id, old_intent, new_intent } = req.body;

    const data = await renameIntent(Number(bot_id), old_intent, new_intent);

    const shouldRetrain = req.body.retrain || req.query.retrain;
    const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

    const toSend = {
      message: "Intent updated",
      success: true,
      data,
      retrained,
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error renaming intent" });
  }
});

router.get("/intents", async (req, res) => {
  try {
    const botId = req.query.bot_id;
    const intents = getIntents(Number(botId));
    const toSend = {
      message: "Got intents",
      success: true,
      data: intents,
    };
    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting intents" });
  }
});

router.get("/intents/full", async (req, res) => {
  try {
    const botId = req.query.bot_id;
    const intents = getIntentsFull(Number(botId));
    const toSend = {
      message: "Got intents",
      success: true,
      data: intents,
    };
    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting intents" });
  }
});

router.delete("/response", async (req, res) => {
  const { intent, answer, bot_id } = req.body;
  const data = await removeResponseFromIntent(Number(bot_id), intent, answer);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;
  const toSend = {
    message: "Response removed",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.put("/response", async (req, res) => {
  const { intent, answer, bot_id } = req.body;
  const data = await addResponseToIntent(Number(bot_id), intent, answer);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;
  const toSend = {
    message: "Responses added",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.delete("/utterance", async (req, res) => {
  const { intent, utterance, bot_id } = req.body;
  const data = await removeUtteranceFromIntent(
    Number(bot_id),
    intent,
    utterance
  );
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;
  const toSend = {
    message: "Utterance removed",
    success: true,
    data,
    retrained,
  };
  res.send(toSend);
});

router.put("/utterance", async (req, res) => {
  const { intent, utterance, bot_id } = req.body;
  const data = await addUtteranceToIntent(Number(bot_id), intent, utterance);
  const shouldRetrain = req.body.retrain || req.query.retrain;
  const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;
  const toSend = {
    message: "Utterance added",
    success: true,
    data,
    retrained,
  };
  res.send(toSend);
});

router.put("/intent/:intent/enhance", async (req, res) => {
  try {
    const { intent } = req.params;
    const { enhance, bot_id } = req.body as {
      enhance: boolean;
      bot_id: number;
    };

    const data = enhanceIntent(Number(bot_id), intent, enhance);

    const shouldRetrain = req.body.retrain || req.query.retrain;

    const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

    const toSend = {
      message: "Intent enhanced",
      success: true,
      data,
      retrained,
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error enhancing intent" });
  }
});

router.put("/intent/:intent/buttons", async (req, res) => {
  const { intent } = req.params;
  const { buttons, bot_id } = req.body as {
    buttons: { type: string }[];
    bot_id: number;
  };

  const data = updateButtonsOnIntent(Number(bot_id), intent, buttons);

  const shouldRetrain = req.body.retrain || req.query.retrain;

  const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

  const toSend = {
    message: "Intent buttons updated",
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.delete("/intent/:intent/button", async (req, res) => {
  const { intent } = req.params;
  const { button, bot_id } = req.body as {
    button: { type: string };
    bot_id: number;
  };

  const data = removeButtonFromIntentByType(
    Number(bot_id),
    intent,
    button.type
  );

  const shouldRetrain = req.body.retrain || req.query.retrain;

  const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

  const toSend = {
    message: `Button with type ${button.type} removed from intent ${intent}`,
    success: true,
    data,
    retrained,
  };

  res.send(toSend);
});

router.get("/buttons", async (req, res) => {
  try {
    const botId = req.query.bot_id;
    const buttons = await getButtons(Number(botId));

    const toSend = {
      message: "Got buttons",
      success: true,
      data: buttons,
    };

    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting buttons" });
  }
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

router.get("/conversations/all", async (req, res) => {
  const data = await getConversations();

  if (!data) {
    res.send({
      message: "Conversations not found",
      success: false,
    });
    return;
  }

  const toSend = {
    message: "Got all conversations",
    success: true,
    data,
  };

  res.send(toSend);
});

router.post(
  "/conversation/:conversation_id/training_copy/",
  async (req, res) => {
    try {
      const { conversation_id } = req.params;

      const formattedID = Number(conversation_id);

      const data = await createTrainingCopyOfConversation(formattedID);

      if (!data) {
        res.send({
          message: "Conversation not found",
          success: false,
        });
        return;
      }

      const toSend = {
        message: "Training copy created",
        success: true,
        data: {
          conversation: data,
          new_conversation_id: data.id,
        },
      };

      res.send(toSend);
    } catch (err) {
      console.error(err);
      res.send({
        message: "Error getting training copy",
        success: false,
      });
    }
  }
);

router.post("/chats/retry/:chat_id", checkIsAdmin, async (req, res) => {
  try {
    const { chat_id, bot_id } = req.params;

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

export default router;
