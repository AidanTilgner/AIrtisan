import { dockStart } from "@nlpjs/basic";
import { generateMetadata } from "./metadata";
import { extractAttachments, filterAttachments } from "./attachments";
import { getBotFileLocations } from "../database/functions/bot";
import { config } from "dotenv";

config();

const daysToMilliseconds = (days: number) => {
  return days * 24 * 60 * 60 * 1000;
};

const getDefaultBotRuntime = () => {
  const days = process.env.BOT_DEFAULT_UPTIME_IN_DAYS
    ? Number(process.env.BOT_DEFAULT_UPTIME_IN_DAYS)
    : 1;

  return daysToMilliseconds(days);
};

export const managers: {
  [id: string]: {
    id: number;
    bot: any;
    running: boolean;
    stopTimeout: NodeJS.Timeout;
  };
} = {};

export const getManager = (id: number) => {
  return managers[String(id)];
};

export const getManagers = () => {
  return managers;
};

export const getActiveManagers = () => {
  const activeManagers: {
    [id: string]: {
      bot: any;
      running: boolean;
      stopTimeout: NodeJS.Timeout;
    };
  } = {};
  Object.keys(managers).forEach((id) => {
    const manager = managers[id];
    if (manager.running) {
      activeManagers[id] = manager;
    }
  });
  return activeManagers;
};

export const getManagerIsAlive = (id: number) => {
  return managers[String(id)]?.running;
};

export const train = async (id: number, forceRetrain = false) => {
  try {
    if (!forceRetrain && managers[String(id)]) {
      managers[String(id)].running = true;
      managers[String(id)].stopTimeout.refresh();
      return managers[String(id)];
    }
    const dock = await dockStart({
      use: ["Basic"],
    });
    // Add the NLU here
    const useBot = await getBotFileLocations(id);
    if (!useBot) {
      console.error("Bot not found");
      return;
    }
    const { corpus_file } = useBot;
    const nlp = dock.get("nlp");
    await nlp.addCorpus(corpus_file);
    await nlp.train();
    managers[String(id)] = {
      id: id,
      bot: nlp,
      running: true,
      stopTimeout: setTimeout(() => {
        managers[String(id)].running = false;
      }, getDefaultBotRuntime()),
    };
    generateMetadata(id);
    return managers[String(id)];
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const retrain = async (id: number): Promise<0 | 1> => {
  try {
    if (managers[String(id)]) {
      managers[String(id)].bot = null;
      managers[String(id)].running = false;
      clearTimeout(managers[String(id)].stopTimeout);
    }

    const dock = await dockStart({
      use: ["Basic"],
    });
    // Add the NLU here
    const useBot = await getBotFileLocations(id);
    if (!useBot) {
      console.error("Bot not found");
      return 0;
    }

    const { corpus_file } = useBot;
    const nlp = dock.get("nlp");
    await nlp.addCorpus(corpus_file);
    await nlp.train();
    managers[String(id)] = {
      id: id,
      bot: nlp,
      running: true,
      stopTimeout: setTimeout(() => {
        managers[String(id)].running = false;
      }, getDefaultBotRuntime()),
    };
    generateMetadata(id);

    return 1;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getRawResponse = async (id: number, text: string) => {
  try {
    const manager = getManager(id);
    if (!manager) {
      console.error("No manager found");
      return null;
    }
    const response = await manager?.bot?.process("en", text);
    return response;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getNLUResponse = async (id: number, text: string) => {
  try {
    if (!id) {
      console.error("No ID provided");
      return null;
    }
    const response = await getRawResponse(id, text);
    if (!response) return null;
    const intent = response.intent as string;
    const entities = response.entities;
    const answer = response.answer as string;
    const attachments = await extractAttachments(id, answer, intent);
    const filteredAnswer = answer
      ? filterAttachments(answer)
      : "Sorry, I don't understand";
    const confidence = Math.round((response.score as number) * 100);
    return {
      intent,
      entities,
      answer: filteredAnswer,
      attachments,
      initial_text: text,
      confidence,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};
