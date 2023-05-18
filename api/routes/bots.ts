import { Router } from "express";
import { checkAPIKeyForBot } from "../middleware/auth";
import { getBotBySlug } from "../../database/functions/bot";

const router = Router();

router.get("/", async (req, res) => {
  try {
    res.send({
      message: "Fetching all bots is not currently supported.",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
});

router.get("/:bot_slug", checkAPIKeyForBot, async (req, res) => {
  try {
    const bot = await getBotBySlug(req.params.bot_slug);

    if (!bot) {
      res.status(404).send({ message: "Bot not found." });
      return;
    }

    res.status(200).send({
      message: "Bot fetched successfully.",
      data: bot,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
});

export default router;
