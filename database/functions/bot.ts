import { Bot } from "../models/bot";
import { dataSource, entities } from "..";
import {
  generateBotFiles,
  generateBotFilesFromTemplate,
} from "../../utils/bot";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { format } from "prettier";
import { Context, Corpus, Model, OwnerTypes } from "../../types/lib";
import path from "path";
import { getManagerIsAlive } from "../../nlu";
import { getAdminOrganizations } from "./admin";
import { Organization } from "../models/organization";
import { Admin } from "../models/admin";
import { getRandomID } from "../../utils/crypto";

interface BotWithLoadedOwner extends Bot {
  owner: Organization | Admin | undefined;
}

export const getBotOwner = async (
  owner_id: number,
  owner_type: OwnerTypes
): Promise<Admin | Organization | null> => {
  try {
    switch (owner_type) {
      case "organization":
        return (await dataSource.manager.findOne(entities.Organization, {
          where: { id: owner_id },
        })) as Organization;
      case "admin":
        return (await dataSource.manager.findOne(entities.Admin, {
          where: { id: owner_id },
        })) as Admin;
      default:
        return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createBot = async ({
  name,
  description,
  bot_version,
  owner_id,
  owner_type,
  enhancement_model,
  bot_language,
  template_id,
}: {
  name: Bot["name"];
  description: Bot["description"];
  bot_version: Bot["bot_version"];
  owner_id: Bot["owner_id"];
  owner_type: Bot["owner_type"];
  enhancement_model: Bot["enhancement_model"];
  bot_language: Bot["bot_language"];
  template_id?: number;
}) => {
  try {
    const bot = new entities.Bot();
    bot.name = name;
    bot.description = description;
    bot.bot_version = bot_version;
    bot.enhancement_model = enhancement_model;
    bot.bot_language = bot_language;
    const foundOwner = await getBotOwner(owner_id, owner_type);
    if (!foundOwner) return null;
    bot.owner_id = foundOwner.id;
    bot.owner_type = owner_type;
    bot.slug = getRandomID();
    const files = template_id
      ? await generateBotFilesFromTemplate(bot, template_id)
      : await generateBotFiles(bot);
    if (!files) return null;
    bot.context_file = files.context_file;
    bot.corpus_file = files.corpus_file;
    bot.model_file = files.model_file;
    await dataSource.manager.save(bot);
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBot = async (id: Bot["id"], loadOwner = false) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });

    if (!bot) return null;

    const botToSend: BotWithLoadedOwner = {
      ...bot,
      owner: undefined,
    };

    if (loadOwner && bot) {
      const owner = await getBotOwner(bot.owner_id, bot.owner_type);
      if (owner) {
        botToSend.owner = owner;
      }
    }

    return botToSend;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotBySlug = async (slug: Bot["slug"], loadOwner = false) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { slug },
    });

    if (!bot) return null;

    const botToSend: BotWithLoadedOwner = {
      ...bot,
      owner: undefined,
    };

    if (loadOwner && bot) {
      const owner = await getBotOwner(bot.owner_id, bot.owner_type);
      if (owner) {
        botToSend.owner = owner;
      }

      return botToSend;
    }

    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBots = async (withOwner = false) => {
  try {
    const bots = await dataSource.manager.find(entities.Bot);
    if (!withOwner) return bots;

    const botsWithOwner = await Promise.all(
      bots.map(async (bot) => {
        const owner = await getBotOwner(bot.owner_id, bot.owner_type);
        return {
          ...bot,
          owner,
        };
      })
    );

    return botsWithOwner;
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
    const files = await getBotFileLocations(bot.id);
    if (!files) return null;
    Object.values(files).forEach((file) => {
      unlinkSync(file);
    });
    await dataSource.manager.remove(bot);
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const filterBotsByVisibility = async (
  bots: Bot[],
  visibility: Bot["visibility"] = "public",
  specific = true
) => {
  try {
    switch (visibility) {
      case "public":
        return bots.filter((bot) => bot.visibility === "public");
      case "private":
        if (!specific) return bots;
        return bots.filter((bot) => bot.visibility === "private");
      case "unlisted":
        return bots.filter((bot) => bot.visibility === "unlisted");
      default:
        return bots.filter((bot) => bot.visibility === "public");
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotsByOwner = async (
  owner_id: number,
  owner_type: OwnerTypes,
  visibility: Bot["visibility"] = "public",
  specific = true
) => {
  try {
    const owner = await getBotOwner(owner_id, owner_type);

    if (!owner) return null;

    const bots = await dataSource.manager.find(entities.Bot, {
      where: { owner_id, owner_type },
    });

    const filtered = await filterBotsByVisibility(bots, visibility, specific);

    if (!filtered) return null;

    const botsWithOwner = await Promise.all(
      filtered.map(async (bot) => {
        const owner = await getBotOwner(bot.owner_id, bot.owner_type);
        return {
          ...bot,
          owner,
        };
      })
    );

    return botsWithOwner;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getRecentBotsByOwner = async (
  owner_id: number,
  owner_type: OwnerTypes,
  visibility?: Bot["visibility"],
  take = 5
) => {
  try {
    const bot = await dataSource.manager.find(entities.Bot, {
      where: { owner_id, owner_type, visibility },
      order: {
        updated_at: "DESC",
      },
      take: take,
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
      context_file: path.join(storageLocation, bot.context_file),
      corpus_file: path.join(storageLocation, bot.corpus_file),
      model_file: path.join(storageLocation, bot.model_file),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const storageLocation = "datastore/bots/documents";

export const getBotCorpus = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    const file = readFileSync(
      path.join(storageLocation, bot.corpus_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file) as Corpus;
    return contents;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotContext = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    const file = readFileSync(
      path.join(storageLocation, bot.context_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    return contents as Context;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotModel = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    const file = readFileSync(
      path.join(storageLocation, bot.model_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    return contents as Model;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBotCorpus = async (
  id: Bot["id"],
  corpus: Corpus
): Promise<Corpus | null> => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    const file = readFileSync(
      path.join(storageLocation, bot.corpus_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    const updatedContents = Object.assign(contents, corpus);
    writeFileSync(
      path.join(storageLocation, bot.corpus_file),
      format(JSON.stringify(updatedContents), {
        parser: "json",
      })
    );
    return updatedContents as Corpus;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBotContext = async (
  id: Bot["id"],
  context: Context
): Promise<Context | null> => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    const formattedContext = Object.entries(context).reduce(
      (acc, [key, value]) => {
        // the key is lowercase in the context file
        acc[key.toLowerCase()] = value;
        return acc;
      },
      {} as Context
    );
    const file = readFileSync(
      path.join(storageLocation, bot.context_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    const updatedContents = Object.assign(contents, formattedContext);
    writeFileSync(
      path.join(storageLocation, bot.context_file),
      format(JSON.stringify(updatedContents), {
        parser: "json",
      })
    );
    return updatedContents as Context;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteBotContextItem = async (id: Bot["id"], key: string) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });

    if (!bot) return null;

    const file = readFileSync(
      path.join(storageLocation, bot.context_file),
      "utf8"
    ).toString();

    const contents = JSON.parse(file);

    delete contents[key];

    writeFileSync(
      path.join(storageLocation, bot.context_file),
      format(JSON.stringify(contents), {
        parser: "json",
      })
    );

    return contents;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateBotModel = async (id: Bot["id"], model: Model) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });
    if (!bot) return null;
    const file = readFileSync(
      path.join(storageLocation, bot.model_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    const updatedContents = Object.assign(contents, model);
    writeFileSync(
      path.join(storageLocation, bot.model_file),
      format(JSON.stringify(updatedContents), {
        parser: "json",
      })
    );
    return updatedContents;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotByName = async (name: Bot["name"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { name },
    });
    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotStatus = async (id: Bot["id"]) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id },
    });

    if (!bot) return null;

    const isAlive = !!getManagerIsAlive(bot.id);

    return isAlive;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const checkAdminHasAccessToBot = async (
  admin_id: number,
  bot_id: number
) => {
  try {
    const bots = await getBotsByOwner(admin_id, "admin", "private", false);

    const bot = bots?.find((bot) => bot.id === bot_id);

    if (bot) return true;

    const organizations = await getAdminOrganizations(admin_id);

    if (!organizations || organizations.length < 1) return false;

    const checkedBots = await Promise.all(
      organizations.map(async (organization) => {
        return await checkBotIsInOrganization(bot_id, organization.id);
      })
    );

    const foundBotInOrganization = checkedBots.some((bot) => bot === true);

    if (foundBotInOrganization) return true;

    return false;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const checkBotIsInOrganization = async (
  bot_id: number,
  organization_id: number
) => {
  try {
    const bot = await getBot(bot_id);

    if (!bot) return false;

    if (bot.owner_type === "organization" && bot.owner_id === organization_id)
      return true;

    return false;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getPublicBotsByOwner = async (
  owner_id: number,
  owner_type: Bot["owner_type"]
) => {
  try {
    const bots = await dataSource.manager.find(entities.Bot, {
      where: { owner_id, owner_type, visibility: "public" },
    });
    return bots;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const addRunningStatusToBots = async (bots: Bot[]) => {
  try {
    const botsWithStatus = await Promise.all(
      bots.map(async (bot) => {
        const status = await getBotStatus(bot.id);
        return {
          running: status,
          owner: await getBotOwner(bot.owner_id, bot.owner_type),
          ...bot,
        };
      })
    );

    return botsWithStatus;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const markBotAsRunning = async (bot_id: number, running: boolean) => {
  try {
    const bot = await dataSource.manager.findOne(entities.Bot, {
      where: { id: bot_id },
    });

    if (!bot) return null;

    bot.is_running = running;

    await dataSource.manager.save(bot);

    return bot;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getRunningBots = async () => {
  try {
    const bots = await dataSource.manager.find(Bot, {
      where: { is_running: true },
    });

    return bots || [];
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBotsAdminHasAccessTo = async (admin_id: number) => {
  try {
    const bots = await getBotsByOwner(admin_id, "admin", "private", false);

    if (!bots) return null;

    const organizations = await getAdminOrganizations(admin_id);

    if (!organizations || organizations.length < 1) return bots;

    const checkedBots = await Promise.all(
      organizations.map(async (organization) => {
        return await getBotsByOwner(
          organization.id,
          "organization",
          "private"
        ).then((bots) => {
          return bots || [];
        });
      })
    );

    const foundBotsInOrganization = checkedBots.some((bots) => bots.length > 0);

    if (foundBotsInOrganization) {
      const botsInOrganization = checkedBots.reduce((acc, bots) => {
        return [...acc, ...bots];
      }, [] as Bot[]);

      return [...bots, ...botsInOrganization];
    }

    return bots;
  } catch (error) {
    console.error(error);
    return null;
  }
};
