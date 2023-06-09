import { Router } from "express";
import { checkIsAdmin, checkIsSuperAdmin } from "../../middleware/auth";
import { Logger } from "../../utils/logger";
import { Admin } from "../../database/models/admin";
import { Feedback } from "../../database/models/feedback";
import {
  createFeedback,
  getAllFeedback,
  getFeedback,
  markFeedbackAsReviewed,
} from "../../database/functions/feedback";
import TemplatesRouter from "./templates";

const router = Router();

const operationsLogger = new Logger({
  name: "Operations Router",
});

router.use("/templates", TemplatesRouter);

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

export default router;
