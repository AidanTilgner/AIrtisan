import { writeFileSync } from "fs";
import path from "path";
import { getRandomString } from "./crypto";
import { format } from "prettier";

const outputLocation = "datastore/bots/documents";

export const generateBotFiles = async (bot: {
  name: string;
  bot_version: string;
  bot_language: string;
  enhancement_model: string;
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
}): Promise<string | null> => {
  try {
    const fileContentsObject = {
      personality: {
        name: bot.name,
        description: bot.name + " is a digital assistant.",
      },
      works_for: {
        name: "Basic Company",
        description:
          "Basic Company is a company that does basic things. We are a company that does basic things.",
        site_url: "https://google.com",
        tagline: "Do basic things.",
        metadata: {
          services: ["Basic Things", "Basic Things"],
          location: "Oregon, United States",
          founded: "2023",
          people: [
            {
              name: "John Doe",
              role: "Co-Founder, CEO",
              contact: {
                email: "johndoe@gmail.com",
                phone: "+p hon-enu-umbe",
              },
            },
          ],
        },
      },
      specification: {
        model: bot.enhancement_model,
        version: bot.bot_version,
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
