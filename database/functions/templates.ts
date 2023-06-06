import { Template } from "../models/template";
import { Bot } from "../models/bot";
import { dataSource } from "..";
import { getRandomID } from "../../utils/crypto";
import { generateTemplateFiles } from "../../utils/bot";

export const createTemplateFromBot = async ({
  bot_id,
  name,
  description,
  owner_id,
  owner_type,
  visibility,
}: {
  bot_id: Bot["id"];
  name: Template["name"];
  description: Template["description"];
  owner_id: Template["owner_id"];
  owner_type: Template["owner_type"];
  visibility: Template["visibility"];
}) => {
  try {
    const bot = await dataSource.manager.findOne(Bot, {
      where: {
        id: bot_id,
      },
    });
    if (!bot) return null;
    const template = new Template();
    template.name = name;
    template.description = description;
    template.slug = getRandomID();
    const files = await generateTemplateFiles(bot.id, template.slug);
    if (!files) return null;
    template.context_file = files.context_file;
    template.corpus_file = files.corpus_file;
    template.model_file = files.model_file;
    template.owner_id = owner_id;
    template.owner_type = owner_type;
    template.visibility = visibility;
    await dataSource.manager.save(template);
    return template;
  } catch (error) {
    console.error(error);
    return null;
  }
};
