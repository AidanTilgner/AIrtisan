import { createBot } from "../functions/bot";
import { config } from "dotenv";

config();

const { DEFAULT_BOT_NAME, DEFAULT_BOT_DESCRIPTION = "A super cool chatbot." } =
  process.env;

export const seedBots = async () => {
  if (!DEFAULT_BOT_NAME) {
    console.info("No bots to seed.");
    return;
  }

  const result = await createBot({
    name: DEFAULT_BOT_NAME,
    description: DEFAULT_BOT_DESCRIPTION,
    bot_version: "1.0.0",
    organization_id: 1,
    enhancement_model: "gpt-3.5-turbo",
    bot_language: "en-US",
  });

  if (result) {
    console.info(`Bot ${DEFAULT_BOT_NAME} created.`);
  } else {
    console.info(`Bot ${DEFAULT_BOT_NAME} could not be created.`);
  }
};
