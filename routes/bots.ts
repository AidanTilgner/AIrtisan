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
  getBotsByOwner,
} from "../database/functions/bot";
import {
  checkIsAdmin,
  checkIsSuperAdmin,
  hasAccessToBot,
} from "../middleware/auth";
import {
  deleteManager,
  getActiveManagers,
  getManagerIsAlive,
  pauseManager,
  train,
} from "../nlu";
import { checkAdminIsInOrganization } from "../database/functions/organization";
import { Admin } from "../database/models/admin";

router.get("/as_admin/all", checkIsSuperAdmin, async (req, res) => {
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

router.get("/running", checkIsSuperAdmin, async (req, res) => {
  try {
    const managers = getActiveManagers();
    res.send({
      message: "Bots fetched successfully",
      success: true,
      data: managers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get("/", checkIsAdmin, async (req, res) => {
  try {
    const adminId = (
      req as unknown as {
        ["admin"]: { id: string };
      }
    )["admin"].id;
    const bots = await getBotsByOwner(Number(adminId), "admin");
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
    const bot = await getBot(Number(req.params.bot_id), true);
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

router.post("/:bot_id/startup", hasAccessToBot, async (req, res) => {
  try {
    if (!req.params.bot_id) {
      return res.status(400).json({ error: "Bot id is required" });
    }
    const bot = getBot(Number(req.params.bot_id));
    if (!bot) {
      return res.status(400).json({ error: "Bot not found" });
    }

    const trained = await train(Number(req.params.bot_id));

    if (!trained) {
      return res.status(400).json({ error: "Bot could not be trained" });
    }

    const { ...manager } = trained;

    res.send({
      message: "Bot trained successfully",
      success: true,
      data: manager,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.post("/:bot_id/pause", hasAccessToBot, async (req, res) => {
  try {
    if (!req.params.bot_id) {
      return res.status(400).json({ error: "Bot id is required" });
    }
    const bot = getBot(Number(req.params.bot_id));
    if (!bot) {
      return res.status(400).json({ error: "Bot not found" });
    }

    const paused = await pauseManager(Number(req.params.bot_id));

    if (!paused) {
      return res.status(400).json({ error: "Bot could not be paused" });
    }

    res.send({
      message: "Bot paused successfully",
      success: true,
      data: paused,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

router.get(
  "/:bot_id/running",
  checkIsAdmin,
  hasAccessToBot,
  async (req, res) => {
    try {
      const bot = getBot(Number(req.params.bot_id));
      if (!bot) {
        return res.status(400).json({ error: "Bot not found" });
      }

      const isRunning = await getManagerIsAlive(Number(req.params.bot_id));

      res.send({
        message: "Bot running status fetched successfully",
        success: true,
        data: isRunning,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }
);

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
    const admin = (
      req as unknown as {
        ["admin"]: Admin;
      }
    )["admin"];

    const {
      name,
      description,
      owner_id,
      owner_type,
      bot_version = "0.1.0 Beta",
      enhancement_model = "gpt-3.5-turbo",
      bot_language = "en-US",
    } = req.body;

    if (admin.id !== owner_id && owner_type === "admin") {
      return res
        .status(401)
        .json({ error: "Admin can only create bots for themselves" });
    }

    if (owner_type === "organization") {
      const belongs = await checkAdminIsInOrganization(owner_id, admin.id);
      if (!belongs) {
        res.status(401).send({
          message: "Admin does not belong to organization",
          success: false,
        });
      }
    }

    if (!name || !description || !owner_id || !owner_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const bot = await createBot({
      name,
      description,
      owner_id,
      owner_type,
      bot_version,
      enhancement_model,
      bot_language,
    });
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
    const managerDeleted = await deleteManager(Number(req.params.bot_id));
    res.send({
      message: "Bot deleted successfully",
      success: managerDeleted && bot ? true : false,
      data: bot,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

export default router;
