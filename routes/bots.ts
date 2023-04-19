import { Router } from "express";

const router = Router();
import {
  createBot,
  getBot,
  getBots,
  updateBot,
  deleteBot,
  getBotCorpus,
  getBotContext,
  getBotModel,
} from "../database/functions/bot";
import { getAdminBots } from "../database/functions/admin";
import {
  checkIsAdmin,
  checkIsSuperAdmin,
  hasAccessToBot,
} from "../middleware/auth";

router.get("/", checkIsSuperAdmin, async (req, res) => {
  try {
    const bots = await getBots();
    res.send({
      message: "Bots fetched successfully",
      success: true,
      data: bots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/all", checkIsAdmin, async (req, res) => {
  try {
    const adminId = (
      req as unknown as {
        ["admin"]: { id: string };
      }
    )["admin"].id;
    const bots = await getAdminBots(Number(adminId));
    res.send({
      message: "Bots fetched successfully",
      success: true,
      data: bots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/:bot_id", hasAccessToBot, async (req, res) => {
  try {
    const bot = await getBot(Number(req.params.bot_id));
    res.send({
      message: "Bot fetched successfully",
      success: true,
      data: bot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/:bot_id/corpus", hasAccessToBot, async (req, res) => {
  try {
    const corpus = await getBotCorpus(Number(req.params.bot_id));
    res.send({
      message: "Bot corpus fetched successfully",
      success: true,
      data: corpus,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/:bot_id/context", hasAccessToBot, async (req, res) => {
  try {
    const context = await getBotContext(Number(req.params.bot_id));
    res.send({
      message: "Bot context fetched successfully",
      success: true,
      data: context,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/:bot_id/model", hasAccessToBot, async (req, res) => {
  try {
    const model = await getBotModel(Number(req.params.bot_id));
    res.send({
      message: "Bot model fetched successfully",
      success: true,
      data: model,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.post("/", checkIsAdmin, async (req, res) => {
  try {
    const bot = await createBot(req.body);
    res.send({
      message: "Bot created successfully",
      success: true,
      data: bot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.put("/:bot_id", hasAccessToBot, async (req, res) => {
  try {
    const bot = await updateBot(Number(req.params.bot_id), req.body);
    res.send({
      message: "Bot updated successfully",
      success: true,
      data: bot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.delete("/:bot_id", hasAccessToBot, async (req, res) => {
  try {
    const bot = await deleteBot(Number(req.params.bot_id));
    res.send({
      message: "Bot deleted successfully",
      success: true,
      data: bot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

export default router;
