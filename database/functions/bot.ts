import { Bot } from "../models/bot";
import { dataSource, entities } from "..";
import { generateBotFiles } from "../../utils/bot";

export const createBot = async ({
  name,
  bot_version,
  organization_id,
  enhancement_model,
  bot_language,
}: {
  name: Bot["name"];
  bot_version: Bot["bot_version"];
  organization_id: Bot["organization"]["id"];
  enhancement_model: Bot["enhancement_model"];
  bot_language: Bot["bot_language"];
}) => {
  try {
    const bot = new entities.Bot();
    bot.name = name;
    bot.bot_version = bot_version;
    bot.enhancement_model = enhancement_model;
    bot.bot_language = bot_language;
    const foundOrg = await dataSource.manager.findOne(entities.Organization, {
      where: { id: organization_id },
    });
    if (!foundOrg) return null;
    bot.organization = foundOrg;
    const files = await generateBotFiles(bot);
    if (!files) return null;
    bot.context_file = files.context_file;
    bot.corpus_file = files.corpus_file;
    bot.model_file = files.model_file;
    await dataSource.manager.save(bot);
    await dataSource.manager.save(foundOrg);
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBot = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBots = async () => {
  try {
    const bots = await dataSource.manager.find(entities.Bot);
    return bots;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBot = async (id: Bot["id"], bot: Partial<Bot>) => {
  try {
    const foundBot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!foundBot) return null;
    const updatedBot = Object.assign(foundBot, bot);
    await dataSource.manager.save(updatedBot);
    return updatedBot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteBot = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    await dataSource.manager.remove(bot);
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotsByOrganization = async (
  organization_id: Bot["organization"]["id"]
) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { organization: { id: organization_id } },
    });
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotFileLocations = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    return {
      context_file: bot.context_file,
      corpus_file: bot.corpus_file,
      model_file: bot.model_file,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};
