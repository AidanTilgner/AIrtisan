import { Template } from "../models/template";
import { Bot } from "../models/bot";
import { dataSource, entities } from "..";
import { getRandomID } from "../../utils/crypto";
import { generateTemplateFiles } from "../../utils/bot";
import { getAdmin, getAdminOrganizations } from "./admin";
import { readFileSync } from "fs";

export const createTemplateFromBot = async ({
  bot_id,
  name,
  description,
  owner_id,
  owner_type,
  visibility = "private",
}: {
  bot_id: Bot["id"];
  name: Template["name"];
  description: Template["description"];
  owner_id: Template["owner_id"];
  owner_type: Template["owner_type"];
  visibility?: Template["visibility"];
}) => {
  try {
    const bot = await dataSource.manager.findOne(Bot, {
      where: {
        id: bot_id,
      },
    });
    if (!bot) return null;
    const template = new entities.Template();
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

export const getTemplateById = async (id: Template["id"]) => {
  try {
    const template = await dataSource.manager.findOne(Template, {
      where: {
        id,
      },
    });
    return template;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getTemplatesByOwner = async (
  owner_id: Template["owner_id"],
  owner_type: Template["owner_type"],
  visibility: Template["visibility"] = "public",
  specific = false
) => {
  try {
    const templates = await dataSource.manager.find(Template, {
      where: {
        owner_id,
        owner_type,
      },
    });
    if (specific) {
      return templates.filter((template) => template.visibility === visibility);
    }

    const publicTemplates = templates.filter(
      (template) => template.visibility === "public"
    );

    const privateTemplates = templates.filter(
      (template) => template.visibility === "private"
    );

    const unlistedTemplates = templates.filter(
      (template) => template.visibility === "unlisted"
    );

    if (visibility === "public") {
      return publicTemplates;
    }

    if (visibility === "unlisted") {
      return unlistedTemplates;
    }

    if (visibility === "private") {
      return [...publicTemplates, ...privateTemplates, ...unlistedTemplates];
    }
    return templates;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getTemplatesAdminHasAccessTo = async (
  admin_id: number
): Promise<Template[]> => {
  try {
    const admin = await getAdmin(admin_id);
    if (!admin) return [];

    const templates = await getTemplatesByOwner(
      admin.id,
      "admin",
      "private",
      true
    );

    if (!templates?.length) return [];

    const adminOrgs = await getAdminOrganizations(admin.id);

    if (!adminOrgs?.length) return templates;

    const orgTemplates = await Promise.all(
      adminOrgs.map((org) =>
        getTemplatesByOwner(org.id, "organization", "private", true)
      )
    );

    return [...templates, ...orgTemplates.flat()];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const templateOutputLocation = "datastore/templates/documents";

export const getTemplateModelFile = async (id: Template["id"]) => {
  try {
    const template = await getTemplateById(id);
    if (!template) return null;
    const modelFile = readFileSync(
      `${templateOutputLocation}/${template.model_file}`
    );
    return JSON.parse(modelFile.toString());
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getTemplateCorpusFile = async (id: Template["id"]) => {
  try {
    const template = await getTemplateById(id);
    if (!template) return null;
    const corpusFile = readFileSync(
      `${templateOutputLocation}/${template.corpus_file}`
    );
    return JSON.parse(corpusFile.toString());
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getTemplateContextFile = async (id: Template["id"]) => {
  try {
    const template = await getTemplateById(id);
    if (!template) return null;
    const contextFile = readFileSync(
      `${templateOutputLocation}/${template.context_file}`
    );
    return JSON.parse(contextFile.toString());
  } catch (error) {
    console.error(error);
    return null;
  }
};
