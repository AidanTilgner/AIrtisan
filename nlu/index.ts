import { dockStart } from "@nlpjs/basic";
import { generateMetadata } from "./metadata";
import { extractAttachments, filterAttachments } from "./attachments";
import { getBotFileLocations } from "../database/functions/bot";

export const managers: {
  [id: number]: {
    bot: any;
    running: boolean;
  };
} = {};

export const getManager = (id: number) => {
  return managers[id];
};

export const getManagers = () => {
  return managers;
};

export const train = async (id: number) => {
  try {
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
    managers[id] = {
      bot: nlp,
      running: true,
    };
    generateMetadata(id);
    return nlp;
  } catch (err) {
    console.error(err);
    return;
  }
};

export const retrain = async (id: number): Promise<0 | 1> => {
  try {
    managers[id].bot = null;
    managers[id].running = false;

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
    managers[id].bot = nlp;
    managers[id].running = true;
    generateMetadata(id);

    return 1;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getRawResponse = async (id: number, text: string) => {
  try {
    const response = await getManager(id)?.bot?.process("en", text);
    return response;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getNLUResponse = async (id: number, text: string) => {
  try {
    const response = await getRawResponse(id, text);
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
