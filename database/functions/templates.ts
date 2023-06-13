import { Template } from "../models/template";
import { Bot } from "../models/bot";
import { dataSource, entities } from "..";
import { getRandomID } from "../../utils/crypto";
import { generateTemplateFiles } from "../../utils/bot";
import { getAdmin, getAdminOrganizations } from "./admin";
import { readFileSync, writeFileSync } from "fs";
import { Context, Corpus, Model } from "../../types/lib";
import path from "path";
import { format } from "prettier";

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
    const files = await generateTemplateFiles(bot.id, template.slug, name);
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

export const createTemplate = async ({
  name,
  description,
  owner_id,
  owner_type,
  visibility = "private",
}: {
  name: Template["name"];
  description: Template["description"];
  owner_id: Template["owner_id"];
  owner_type: Template["owner_type"];
  visibility?: Template["visibility"];
}) => {
  try {
    const template = new entities.Template();
    template.name = name;
    template.description = description;
    template.slug = getRandomID();
    const files = await generateTemplateFiles(null, template.slug, name);
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

export const updateTemplate = async ({
  id,
  name,
  description,
  visibility,
}: {
  id: Template["id"];
  name?: Template["name"];
  description?: Template["description"];
  visibility?: Template["visibility"];
}) => {
  try {
    const template = await dataSource.manager.findOne(Template, {
      where: {
        id,
      },
    });

    if (!template) return null;

    if (name) template.name = name;
    if (description) template.description = description;
    if (visibility) template.visibility = visibility;

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

    if (admin.role === "superadmin") {
      const templates = await dataSource.manager.find(Template);
      return templates;
    }

    const templates = await getTemplatesByOwner(
      admin.id,
      "admin",
      "private",
      false
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
    return JSON.parse(modelFile.toString()) as Model;
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
    return JSON.parse(corpusFile.toString()) as Corpus;
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
    return JSON.parse(contextFile.toString()) as Context;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const checkAdminHasAccessToTemplate = async (
  admin_id: number,
  template_id: Template["id"]
) => {
  try {
    const admin = await getAdmin(admin_id);
    if (!admin) return false;
    if (admin.role === "superadmin") return true;

    const template = await getTemplateById(template_id);

    if (!template) return false;

    if (template.owner_id === admin.id && template.owner_type === "admin")
      return true;

    const adminOrgs = await getAdminOrganizations(admin.id);

    if (!adminOrgs?.length) return false;

    if (template.owner_type === "organization") {
      return adminOrgs.some((org) => org.id === template.owner_id);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateTemplateCorpus = async (
  id: Template["id"],
  corpus: Corpus
): Promise<Corpus | null> => {
  try {
    const template = await dataSource.manager.findOne(entities.Template, {
      where: { id },
    });
    if (!template) return null;
    const file = readFileSync(
      path.join(templateOutputLocation, template.corpus_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    const updatedContents = Object.assign(contents, corpus);
    writeFileSync(
      path.join(templateOutputLocation, template.corpus_file),
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

export const updateTemplateContext = async (
  id: Template["id"],
  context: Context
): Promise<Context | null> => {
  try {
    const template = await dataSource.manager.findOne(entities.Template, {
      where: { id },
    });
    if (!template) return null;
    const formattedContext = Object.entries(context).reduce(
      (acc, [key, value]) => {
        // the key is lowercase in the context file
        acc[key.toLowerCase()] = value;
        return acc;
      },
      {} as Context
    );
    const file = readFileSync(
      path.join(templateOutputLocation, template.context_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    const updatedContents = Object.assign(contents, formattedContext);
    writeFileSync(
      path.join(templateOutputLocation, template.context_file),
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

export const deleteTemplateContextItem = async (
  id: Template["id"],
  key: string
) => {
  try {
    const template = await dataSource.manager.findOne(entities.Template, {
      where: { id },
    });

    if (!template) return null;

    const file = readFileSync(
      path.join(templateOutputLocation, template.context_file),
      "utf8"
    ).toString();

    const contents = JSON.parse(file);

    delete contents[key];

    writeFileSync(
      path.join(templateOutputLocation, template.context_file),
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

export const updateTemplateModel = async (id: Template["id"], model: Model) => {
  try {
    const template = await dataSource.manager.findOne(entities.Template, {
      where: { id },
    });
    if (!template) return null;
    const file = readFileSync(
      path.join(templateOutputLocation, template.model_file),
      "utf8"
    ).toString();
    const contents = JSON.parse(file);
    const updatedContents = Object.assign(contents, model);
    writeFileSync(
      path.join(templateOutputLocation, template.model_file),
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
