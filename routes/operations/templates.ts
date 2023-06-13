import { Router } from "express";
import { Logger } from "../../utils/logger";
import {
  checkIsAdmin,
  hasAccessToBot,
  hasAccessToTemplate,
} from "../../middleware/auth";
import { Admin } from "../../database/models/admin";
import { Bot } from "../../database/models/bot";
import { Context, Corpus, Model, OwnerTypes } from "../../types/lib";
import { checkAdminIsInOrganization } from "../../database/functions/organization";
import {
  createTemplateFromBot,
  getTemplateById,
  getTemplateContextFile,
  getTemplateCorpusFile,
  getTemplateModelFile,
  getTemplatesAdminHasAccessTo,
  updateTemplate,
  updateTemplateContext,
  updateTemplateCorpus,
  updateTemplateModel,
  deleteTemplateContextItem,
} from "../../database/functions/templates";
import {
  addContextToDatapoint,
  addData,
  addResponseToIntent,
  addUtteranceToIntent,
  deleteDataPoint,
  enhanceIntent,
  removeButtonFromIntentByType,
  removeResponseFromIntent,
  removeUtteranceFromIntent,
  renameIntent,
  updateButtonsOnIntent,
  removeContextFromDatapoint,
} from "../../nlu/templates";

const router = Router();

const templatesLogger = new Logger({
  name: "Operations Router",
});

router.post("/", checkIsAdmin, hasAccessToBot, async (req, res) => {
  try {
    const admin = req["admin"] as Admin;
    const bot = req["bot"] as Bot;

    const templateFields = req.body as {
      bot_id: number | undefined;
      name: string;
      description: string;
      owner_id: number;
      owner_type: OwnerTypes;
    };

    if (!admin) {
      res.status(400).send({ message: "Unauthorized." });
      return;
    }

    if (
      admin.id !== templateFields.owner_id &&
      templateFields.owner_type === "admin"
    ) {
      return res
        .status(401)
        .json({ error: "Users can only create bots for themselves" });
    }

    if (!bot || (templateFields.bot_id && templateFields.bot_id !== bot.id)) {
      res.status(400).send({ message: "Unauthorized." });
      return;
    }

    if (templateFields.owner_type === "organization") {
      const belongs = await checkAdminIsInOrganization(admin.id, admin.id);
      if (!belongs) {
        res.status(401).send({
          message: "Admin does not belong to organization",
          success: false,
        });
      }
    }

    [
      (fields: typeof templateFields) => fields.name,
      (fields: typeof templateFields) => fields.description,
      (fields: typeof templateFields) => fields.owner_id,
      (fields: typeof templateFields) =>
        fields.owner_type === "organization" || fields.owner_type === "admin",
    ].forEach((field) => {
      if (!field(templateFields)) {
        res.status(400).send({ message: "Invalid template fields." });
        return;
      }
    });

    const template = await createTemplateFromBot({
      bot_id: bot.id,
      name: templateFields.name,
      description: templateFields.description,
      owner_id: templateFields.owner_id,
      owner_type: templateFields.owner_type,
    });

    if (!template) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Template created successfully.",
      success: true,
      data: template,
    });
  } catch (error) {
    templatesLogger.error("Error creating template: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/all", checkIsAdmin, async (req, res) => {
  try {
    const admin = req["admin"] as Admin;

    if (!admin) {
      res.status(400).send({ message: "Unauthorized." });
      return;
    }

    const templates = await getTemplatesAdminHasAccessTo(admin.id);

    res.status(200).send({
      message: "Templates fetched successfully.",
      success: true,
      data: templates,
    });
  } catch (error) {
    templatesLogger.error("Error fetching templates: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get(
  "/:template_id",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template." });
        return;
      }

      const template = await getTemplateById(Number(template_id));

      if (!template) {
        res.status(400).send({ message: "Template not found." });
        return;
      }

      res.status(200).send({
        message: "Template fetched successfully.",
        success: true,
        data: template,
      });
    } catch (error) {
      templatesLogger.error("Error fetching template: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.get(
  "/:template_id/model",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template id." });
        return;
      }

      const modelFile = await getTemplateModelFile(Number(template_id));

      if (!modelFile) {
        res.status(400).send({ message: "Template model not found." });
        return;
      }

      res.status(200).send({
        message: "Template fetched successfully.",
        success: true,
        data: modelFile,
      });
    } catch (error) {
      templatesLogger.error("Error fetching template model: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.get(
  "/:template_id/context",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template id." });
        return;
      }

      const contextFile = await getTemplateContextFile(Number(template_id));

      if (!contextFile) {
        res.status(400).send({ message: "Template context not found." });
        return;
      }

      res.status(200).send({
        message: "Template fetched successfully.",
        success: true,
        data: contextFile,
      });
    } catch (error) {
      templatesLogger.error("Error fetching template context: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.get(
  "/:template_id/corpus",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template id." });
        return;
      }

      const corpusFile = await getTemplateCorpusFile(Number(template_id));

      if (!corpusFile) {
        res.status(400).send({ message: "Template corpus not found." });
        return;
      }

      res.status(200).send({
        message: "Template fetched successfully.",
        success: true,
        data: corpusFile,
      });
    } catch (error) {
      templatesLogger.error("Error fetching template corpus: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.put("/:template_id", checkIsAdmin, async (req, res) => {
  try {
    const admin = req["admin"] as Admin;
    const { template_id } = req.params;

    if (!admin) {
      res.status(400).send({ message: "Unauthorized." });
      return;
    }

    if (!Number(template_id)) {
      res.status(400).send({ message: "No template id." });
      return;
    }

    const templateFields = req.body as {
      name: string;
      description: string;
    };

    if (!templateFields.name && !templateFields.description) {
      res.status(400).send({ message: "No template fields." });
      return;
    }

    const updatedTemplate = await updateTemplate({
      id: Number(template_id),
      name: templateFields.name,
      description: templateFields.description,
    });

    res.status(200).send({
      message: "Template updated successfully.",
      success: true,
      data: updatedTemplate,
    });

    return;
  } catch (error) {
    templatesLogger.error("Error updating template: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.put(
  "/:template_id/model",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template id." });
        return;
      }

      const templateModel = req.body as {
        model: Model;
      };

      if (!templateModel.model) {
        res.status(400).send({ message: "No template model." });
        return;
      }

      const updatedTemplate = await updateTemplateModel(Number(template_id), {
        ...templateModel.model,
      });

      res.status(200).send({
        message: "Template updated successfully.",
        success: true,
        data: updatedTemplate,
      });

      return;
    } catch (error) {
      templatesLogger.error("Error updating template model: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.put(
  "/:template_id/context",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template id." });
        return;
      }

      const templateContext = req.body as {
        context: Context;
      };

      if (!templateContext.context) {
        res.status(400).send({ message: "No template context." });
        return;
      }

      const updatedTemplate = await updateTemplateContext(Number(template_id), {
        ...templateContext.context,
      });

      res.status(200).send({
        message: "Template updated successfully.",
        success: true,
        data: updatedTemplate,
      });

      return;
    } catch (error) {
      templatesLogger.error("Error updating template context: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.put(
  "/:template_id/corpus",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const admin = req["admin"] as Admin;
      const { template_id } = req.params;

      if (!admin) {
        res.status(400).send({ message: "Unauthorized." });
        return;
      }

      if (!Number(template_id)) {
        res.status(400).send({ message: "No template id." });
        return;
      }

      const templateCorpus = req.body as {
        corpus: Corpus;
      };

      if (!templateCorpus.corpus) {
        res.status(400).send({ message: "No template corpus." });
        return;
      }

      const updatedTemplate = await updateTemplateCorpus(Number(template_id), {
        ...templateCorpus.corpus,
      });

      res.status(200).send({
        message: "Template updated successfully.",
        success: true,
        data: updatedTemplate,
      });

      return;
    } catch (error) {
      templatesLogger.error("Error updating template corpus: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.delete(
  "/:template_id/context",
  checkIsAdmin,
  hasAccessToTemplate,
  async (req, res) => {
    const admin = req["admin"] as Admin;
    const { template_id } = req.params;

    if (!admin) {
      res.status(400).send({ message: "Unauthorized." });
      return;
    }

    if (!Number(template_id)) {
      res.status(400).send({ message: "No template id." });
      return;
    }

    const templateContext = req.body as {
      key: keyof Context;
    };

    if (!templateContext.key) {
      res.status(400).send({ message: "No template context key." });
      return;
    }

    const updatedTemplate = await deleteTemplateContextItem(
      Number(template_id),
      templateContext.key
    );

    res.status(200).send({
      message: "Template updated successfully.",
      success: true,
      data: updatedTemplate,
    });

    return;
  }
);

router.delete(
  "/:template_id/corpus/intents/response",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;
      const { intent, answer } = req.body;

      if (!template_id || !intent || !answer) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await removeResponseFromIntent(
        Number(template_id),
        intent,
        answer
      );

      const toSend = {
        message: "Response removed",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error removing response from intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.delete(
  "/:template_id/corpus/intents/utterance",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;
      const { intent, utterance } = req.body;

      if (!template_id || !intent || !utterance) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await removeUtteranceFromIntent(
        Number(template_id),
        intent,
        utterance
      );

      const toSend = {
        message: "Utterance removed",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error removing utterance from intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.delete(
  "/:template_id/corpus/intents",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;
      const { intent } = req.body;

      if (!template_id || !intent) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await deleteDataPoint(Number(template_id), intent);

      const toSend = {
        message: "Intent removed",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error removing intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.delete(
  "/:template_id/corpus/intents/context",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;
      const { intent, context } = req.body;

      if (!template_id || !intent || !context) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await removeContextFromDatapoint(
        Number(template_id),
        intent,
        context
      );

      const toSend = {
        message: "Context removed",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error removing context from intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.delete(
  "/:template_id/corpus/intents/buttons",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;
      const { intent, button } = req.body;

      if (!template_id || !intent || !button) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await removeButtonFromIntentByType(
        Number(template_id),
        intent,
        button
      );

      const toSend = {
        message: "Button removed",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error removing button from intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.post(
  "/:template_id/corpus/intents/utterance",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;
      const { intent, utterance } = req.body;

      if (!template_id || !intent || !utterance) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await addUtteranceToIntent(
        Number(template_id),
        intent,
        utterance
      );

      const toSend = {
        message: "Utterance added",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error adding utterance to intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.post(
  "/:template_id/corpus/intents/response",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;

      const { intent, answer } = req.body;

      if (!template_id || !intent || !answer) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await addResponseToIntent(
        Number(template_id),
        intent,
        answer
      );

      const toSend = {
        message: "Response added",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error adding response to intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.post(
  "/:template_id/corpus/intents/context",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;

      const { intent, context } = req.body;

      if (!template_id || !intent || !context) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await addContextToDatapoint(
        Number(template_id),
        intent,
        context
      );

      const toSend = {
        message: "Context added",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error adding context to intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.put(
  "/:template_id/corpus/intents/buttons",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;

      const { intent, buttons } = req.body;

      if (!template_id || !intent || !buttons) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await updateButtonsOnIntent(
        Number(template_id),
        intent,
        buttons
      );

      const toSend = {
        message: "Buttons added",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error adding buttons to intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.post(
  "/:template_id/corpus/intents",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;

      const { intent, utterance, answer, buttons } = req.body;

      if (!template_id || !intent || !utterance || !answer) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await addData({
        id: Number(template_id),
        intent,
        utterances: [utterance],
        answers: [answer],
        enhance: false,
        buttons,
      });

      const toSend = {
        message: "Intent added",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error adding intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.put(
  "/:template_id/corpus/intents/enhance",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;

      const { intent, enhance } = req.body;

      if (!template_id || !intent) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await enhanceIntent(Number(template_id), intent, enhance);

      const toSend = {
        message: "Intent enhanced",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error enhancing intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

router.put(
  "/:template_id/corpus/intents/rename",
  hasAccessToTemplate,
  async (req, res) => {
    try {
      const { template_id } = req.params;

      const { intent, new_intent } = req.body;

      if (!template_id || !intent || !new_intent) {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const data = await renameIntent(Number(template_id), intent, new_intent);

      const toSend = {
        message: "Intent renamed",
        success: true,
        data,
      };

      res.send(toSend);
    } catch (error) {
      templatesLogger.error("Error renaming intent: ", error);
      res.status(500).send({ message: "Internal server error." });
    }
  }
);

export default router;
