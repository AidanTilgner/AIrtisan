import { Router } from "express";
import { checkIsAdmin } from "../middleware/auth";
import { Logger } from "../utils/logger";
import { Admin } from "../database/models/admin";
import { Feedback } from "../database/models/feedback";
import { createFeedback } from "../database/functions/feedback";

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

export default router;
