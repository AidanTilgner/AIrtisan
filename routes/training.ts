import {
  addContextToDatapoint,
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
  removeContextFromDatapoint,
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
import { checkIsAdmin, hasAccessToBot } from "../middleware/auth";
import {
  getBotContext,
  getBotModel,
  updateBotContext,
  deleteBotContextItem,
  updateBotModel,
  getBot,
} from "../database/functions/bot";
import { getWebsitePageLinks } from "../utils/puppeteer";
import { handleBuildContextObjectForPages } from "../utils/context";

const router = Router();

router.use(checkIsAdmin);

router.post("/say", hasAccessToBot, async (req, res) => {
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

  res.send(toSend);
});

router.get("/corpus", hasAccessToBot, async (req, res) => {
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
    res.send(toSend);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error getting default corpus" });
  }
});

router.get("/context", hasAccessToBot, async (req, res) => {
  try {
    const botId = req.query.bot_id;

    if (!botId) {
      res.status(400).send({ message: "Missing botId." });
      return;
    }

    const context = await getBotContext(Number(botId));

    const toSend = {
      message: "Got context",
      success: true,
      data: context,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

router.put("/context", hasAccessToBot, async (req, res) => {
  try {
    const botId = req.body.bot_id || req.query.bot_id;

    if (!botId) {
      res.status(400).send({ message: "Missing botId." });
      return;
    }

    const update = req.body.context;

    if (!update) {
      res.status(400).send({ message: "Missing update." });
      return;
    }

    const context = await updateBotContext(Number(botId), update);

    const toSend = {
      message: "Updated context",
      success: true,
      data: context,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
});

router.delete("/context", hasAccessToBot, async (req, res) => {
  try {
    const botId = req.body.bot_id || req.query.bot_id;

    if (!botId) {
      res.status(400).send({ message: "Missing botId." });
      return;
    }

    const key = req.body.key;

    if (!key) {
      res.status(400).send({ message: "Missing key." });
      return;
    }

    const context = await deleteBotContextItem(Number(botId), key);

    const toSend = {
      message: "Deleted context piece",
      success: true,
      data: context,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
});

router.get("/model", hasAccessToBot, async (req, res) => {
  try {
    const botId = req.query.bot_id;

    if (!botId) {
      res.status(400).send({ message: "Missing botId." });
      return;
    }

    const model = await getBotModel(Number(botId));

    const toSend = {
      message: "Got model",
      success: true,
      data: model,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

router.put("/model", hasAccessToBot, async (req, res) => {
  try {
    const botId = req.body.bot_id || req.query.bot_id;

    if (!botId) {
      res.status(400).send({ message: "Missing botId." });
    }

    const update = req.body.model;

    if (!update) {
      res.status(400).send({ message: "Missing update." });
      return;
    }

    const model = await updateBotModel(Number(botId), update);

    const toSend = {
      message: "Updated model",
      success: true,
      data: model,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.send({ error });
  }
});

router.post("/datapoint", hasAccessToBot, async (req, res) => {
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

    const newData = data;

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

router.delete("/datapoint", hasAccessToBot, async (req, res) => {
  try {
    const { intent, bot_id } = req.body;

    if (!intent || !bot_id) {
      res.status(400).send({ message: "Missing intent or bot_id." });
      return;
    }

    const corpus = await deleteDataPoint(Number(bot_id), intent);
    if (!corpus) {
      res.status(500).send({ message: "Error removing data" });
      return;
    }
    const { data: newData } = corpus;
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

router.post("/retrain", hasAccessToBot, async (req, res) => {
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

router.get("/intent/:intent", hasAccessToBot, async (req, res) => {
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

router.put("/intent", hasAccessToBot, async (req, res) => {
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

router.put("/intent/rename", hasAccessToBot, async (req, res) => {
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

router.get("/intents", hasAccessToBot, async (req, res) => {
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

router.get("/intents/full", hasAccessToBot, async (req, res) => {
  try {
    const botId = req.query.bot_id;
    const intents = await getIntentsFull(Number(botId));
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

router.delete("/response", hasAccessToBot, async (req, res) => {
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

router.put("/response", hasAccessToBot, async (req, res) => {
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

router.delete("/utterance", hasAccessToBot, async (req, res) => {
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

router.put("/utterance", hasAccessToBot, async (req, res) => {
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

router.put("/intent/:intent/enhance", hasAccessToBot, async (req, res) => {
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

router.put("/intent/:intent/context", hasAccessToBot, async (req, res) => {
  try {
    const { intent } = req.params;
    const { context, bot_id } = req.body as {
      context: string;
      bot_id: number;
    };

    const data = addContextToDatapoint(Number(bot_id), intent, context);

    const shouldRetrain = req.body.retrain || req.query.retrain;

    const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

    const toSend = {
      message: "Intent context added",
      success: true,
      data,
      retrained,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

router.delete("/intent/:intent/context", hasAccessToBot, async (req, res) => {
  try {
    const { intent } = req.params;

    const { context, bot_id } = req.body as {
      context: string;
      bot_id: number;
    };

    const data = removeContextFromDatapoint(Number(bot_id), intent, context);

    const shouldRetrain = req.body.retrain || req.query.retrain;

    const retrained = shouldRetrain ? await retrain(Number(bot_id)) : false;

    const toSend = {
      message: "Intent context removed",
      success: true,
      data,
      retrained,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error });
  }
});

router.put("/intent/:intent/buttons", hasAccessToBot, async (req, res) => {
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

router.delete("/intent/:intent/button", hasAccessToBot, async (req, res) => {
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

router.get("/buttons", hasAccessToBot, async (req, res) => {
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

router.post("/context/auto/pagelinks", hasAccessToBot, async (req, res) => {
  try {
    const { website_url, exclude = [] } = req.body as {
      website_url: string;
      exclude: string[];
    };

    if (!website_url) {
      res.status(400).send({ message: "Missing website_url" });
      return;
    }

    const PAGES_TO_CRAWL = 25;
    const data = await getWebsitePageLinks(
      website_url,
      PAGES_TO_CRAWL,
      exclude
    );

    const toSend = {
      message: "Got page links",
      success: true,
      data,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error getting links." });
  }
});

router.post("/context/auto/generate", hasAccessToBot, async (req, res) => {
  try {
    const { pages } = req.body as {
      pages: string[];
    };
    const bot_id = req.query.bot_id || req.body.bot_id;

    if (!bot_id) {
      res.status(400).send({ message: "Missing bot_id" });
      return;
    }

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      res.status(400).send({ message: "Missing pages" });
      return;
    }

    const data = await handleBuildContextObjectForPages(pages);

    const updatedContext = await updateBotContext(Number(bot_id), data);

    const toSend = {
      message: "Got context",
      success: true,
      data: updatedContext,
    };

    res.send(toSend);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error generating context." });
  }
});

export default router;
