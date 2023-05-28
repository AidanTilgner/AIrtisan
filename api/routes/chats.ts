import { Router } from "express";
import {
  validateAllowingWidgetsForBot,
  validateDomainForBot,
} from "../middleware/bot";
import { markChatForReview } from "../../database/functions/conversations";

const router = Router();

router.post(
  "/:chat_id/should_review",
  validateDomainForBot,
  validateAllowingWidgetsForBot,
  async (req, res) => {
    try {
      const { chat_id } = req.params;
      const { review_message } = req.body;

      const marked = await markChatForReview(Number(chat_id), review_message);

      if (!marked) {
        res.status(404).send({ message: "Chat not found" });
        return;
      }

      res.send({ message: "Chat marked for review", data: marked });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error updating chat" });
    }
  }
);

export default router;
