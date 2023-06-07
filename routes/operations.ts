import { Router } from "express";
import {
  checkIsAdmin,
  checkIsSuperAdmin,
  hasAccessToBot,
} from "../middleware/auth";
import { Logger } from "../utils/logger";
import { Admin } from "../database/models/admin";
import { Feedback } from "../database/models/feedback";
import {
  createFeedback,
  getAllFeedback,
  getFeedback,
  markFeedbackAsReviewed,
} from "../database/functions/feedback";
import {
  createTemplateFromBot,
  getTemplatesAdminHasAccessTo,
} from "../database/functions/templates";
import { Bot } from "../database/models/bot";
import { OwnerTypes } from "../types/lib";
import { checkAdminIsInOrganization } from "../database/functions/organization";

const router = Router();

const operationsLogger = new Logger({
  name: "Operations Router",
});

router.post("/feedback", checkIsAdmin, async (req, res) => {
  try {
    const admin = req["admin"] as Admin;
    const { feedback, type } = req.body as {
      feedback: Feedback["feedback"];
      type: Feedback["type"];
    };

    if (!feedback) {
      res.status(400).send({ message: "Feedback cannot be empty." });
      return;
    }

    if (!type) {
      res.status(400).send({ message: "Type cannot be empty." });
      return;
    }

    const newFeedback = await createFeedback({
      feedback: feedback,
      admin: admin,
      type: type,
    });

    if (!newFeedback) {
      res.status(500).send({ message: "Internal server error." });
      return;
    }

    res.status(200).send({
      message: "Feedback created successfully.",
      success: true,
      data: newFeedback,
    });
  } catch (error) {
    operationsLogger.error("Error creating feedback: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/feedback/all", checkIsSuperAdmin, async (req, res) => {
  try {
    const feedback = await getAllFeedback();

    res.status(200).send({
      message: "Feedback fetched successfully.",
      success: true,
      data: feedback,
    });
  } catch (error) {
    operationsLogger.error("Error fetching feedback: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/feedback/:id", checkIsSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number(id)) {
      res.status(400).send({ message: "No feedback." });
      return;
    }

    const feedback = await getFeedback(Number(id));

    if (!feedback) {
      res.status(400).send({ message: "Feedback not found." });
      return;
    }

    res.status(200).send({
      message: "Feedback fetched successfully.",
      success: true,
      data: feedback,
    });
  } catch (error) {
    operationsLogger.error("Error fetching feedback: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/feedback/:id/review", checkIsSuperAdmin, async (req, res) => {
  try {
    const admin = req["admin"] as Admin;
    const { review_message } = req.body as {
      review_message: Feedback["review_message"];
    };
    const { id } = req.params;

    if (!admin) {
      res.status(400).send({ message: "Unauthorized." });
      return;
    }

    if (!Number(id)) {
      res.status(400).send({ message: "No reviewer." });
      return;
    }

    const feedback = await markFeedbackAsReviewed(
      Number(id),
      review_message,
      admin.username
    );

    res.status(200).send({
      message: "Feedback reviewed successfully.",
      success: true,
      data: feedback,
    });
  } catch (error) {
    operationsLogger.error("Error reviewing feedback: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.post("/template", checkIsAdmin, hasAccessToBot, async (req, res) => {
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
    operationsLogger.error("Error creating template: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

router.get("/templates/all", checkIsAdmin, async (req, res) => {
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
    operationsLogger.error("Error fetching templates: ", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

export default router;
