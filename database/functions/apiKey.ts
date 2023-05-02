import { entities, dataSource } from "..";
import { generateRandomApiKey } from "../../utils/crypto";
import { hashPassword } from "../../utils/crypto";
import { getBot } from "./bot";

export const createApiKey = async (name: string, bot_id: number) => {
  try {
    const bot = await getBot(bot_id);
    if (!bot) return null;
    const key = generateRandomApiKey();
    const newKey = new entities.ApiKey();
    newKey.key = hashPassword(key);
    newKey.for = name;
    newKey.bot = bot;
    const result = await dataSource.manager.save(newKey);
    return {
      result,
      generated_key: key,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getApiKey = async (name: string, bot_id: number) => {
  try {
    const result = await dataSource.manager.findOne(entities.ApiKey, {
      where: {
        for: name,
        bot: {
          id: bot_id,
        },
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getApiKeyByKey = async (key: string) => {
  try {
    const result = await dataSource.manager.findOne(entities.ApiKey, {
      where: {
        key,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getAllApiKeys = async () => {
  try {
    const result = await dataSource.manager.find(entities.ApiKey);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteApiKey = async (id: number) => {
  try {
    const result = await dataSource.manager.delete(entities.ApiKey, id);
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteApiKeyByName = async (name: string) => {
  try {
    const result = await dataSource.manager.delete(entities.ApiKey, {
      for: name,
    });
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
};
