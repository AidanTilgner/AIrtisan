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

router.get("/", (req, res) => {
  res.send("Hello World!");
});

export default router;
