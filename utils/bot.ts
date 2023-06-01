import { writeFileSync } from "fs";
import path from "path";
import { getRandomString } from "./crypto";
import { format } from "prettier";
import { AllowedChatModels, Model } from "../types/lib";
import { getBotOwner } from "../database/functions/bot";
import { Bot } from "../database/models/bot";
import { Organization } from "../database/models/organization";
import { Admin } from "../database/models/admin";

const outputLocation = "datastore/bots/documents";

export const generateBotFiles = async (bot: {
  name: string;
  bot_version: string;
  bot_language: string;
  enhancement_model: string;
  owner_type: Bot["owner_type"];
  owner_id: Bot["owner_id"];
  description: string;
}): Promise<{
  context_file: string;
  corpus_file: string;
  model_file: string;
} | null> => {
  try {
    const randomString = getRandomString(10);
    const contextFile = await getBotContextFileContents(bot);
    if (!contextFile) return null;
    const contextFileName = `${bot.name}-${bot.bot_language}-${randomString}-context.json`;
    writeFileSync(path.join(outputLocation, contextFileName), contextFile);
    const corpusFile = await getBotCorpusFileContents(bot);
    if (!corpusFile) return null;
    const corpusFileName = `${bot.name}-${bot.bot_language}-${randomString}-corpus.json`;
    writeFileSync(path.join(outputLocation, corpusFileName), corpusFile);
    const modelFile = await getBotModelFileContents(bot);
    if (!modelFile) return null;
    const modelFileName = `${bot.name}-${bot.bot_language}-${randomString}-model.json`;
    writeFileSync(path.join(outputLocation, modelFileName), modelFile);

    return {
      context_file: contextFileName,
      corpus_file: corpusFileName,
      model_file: modelFileName,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotContextFileContents = async (bot: {
  name: string;
  bot_version: string;
}): Promise<string | null> => {
  try {
    const fileContentsObject = {
      name: bot.name,
    };
    const fileContents = format(JSON.stringify(fileContentsObject), {
      parser: "json",
    });
    return fileContents;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotCorpusFileContents = async (bot: {
  name: string;
  bot_version: string;
  bot_language: string;
}): Promise<string | null> => {
  try {
    const fileContentsObject = {
      name: bot.name,
      locale: bot.bot_language,
      data: [
        {
          intent: "say hello",
          utterances: ["hey", "hey there", "hi there", "ciao", "hello"],
          answers: [
            "Hi! How can I help you?",
            "Hello, how can I help you?",
            "Hey there, how can I help you?",
            "Hey, how are you?",
            "Hello, how are you?",
            "Hey! How can I help you?",
          ],
          buttons: [{ type: "begin_training" }],
          enhance: false,
        },
      ],
    };
    const fileContents = format(JSON.stringify(fileContentsObject), {
      parser: "json",
    });
    return fileContents;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotModelFileContents = async (bot: {
  name: string;
  bot_version: string;
  enhancement_model: string;
  owner_type: Bot["owner_type"];
  owner_id: Bot["owner_id"];
  description: string;
}): Promise<string | null> => {
  try {
    const botOwner = await getBotOwner(bot.owner_id, bot.owner_type);

    const fileContentsObject: Model = {
      personality: {
        name: bot.name,
        description: bot.description,
        initial_prompt: "",
      },
      works_for: {
        name:
          bot.owner_type === "organization"
            ? (botOwner as Organization).name
            : (botOwner as Admin).display_name || (botOwner as Admin).username,
        description:
          bot.owner_type === "organization"
            ? (botOwner as Organization).description
            : "",
        site_url: "",
        tagline: "",
        metadata: {},
      },
      specification: {
        model: bot.enhancement_model as AllowedChatModels,
        version: bot.bot_version,
        none_fallback: false,
        hipaa_compliant: false,
      },
      security: {
        domain_whitelist: [],
        allow_widgets: true,
      },
    };
    const fileContents = format(JSON.stringify(fileContentsObject), {
      parser: "json",
    });
    return fileContents;
  } catch (error) {
    console.error(error);
    return null;
  }
};
