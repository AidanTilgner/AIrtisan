import { OwnerTypes } from "../../types/lib";
import { createBot, getBotByName } from "../functions/bot";
import { config } from "dotenv";

config();

const { BOTS } = process.env;

export const seedBots = async () => {
  if (!BOTS) {
    console.info("No bots to seed.");
    return;
  }

  const bots = BOTS.split(",");
  bots.forEach(async (bot) => {
    const [owner_id, owner_type, bot_name, description = "A very nice bot."] =
      bot.split(":");

    const existingBot = await getBotByName(bot_name);

    if (existingBot) {
      console.info(`Bot ${bot_name} already exists.`);
      return;
    }

    console.log("Creating bot", bot_name, description, owner_id, owner_type);

    const result = await createBot({
      name: bot_name,
      description: description,
      bot_version: "1.0.0",
      owner_id: Number(owner_id),
      owner_type: owner_type as OwnerTypes,
      enhancement_model: "gpt-3.5-turbo",
      bot_language: "en-US",
    });

    if (result) {
      console.info(`Bot ${bot_name} created.`);
    } else {
      console.info(`Bot ${bot_name} could not be created.`);
    }
  });
};
