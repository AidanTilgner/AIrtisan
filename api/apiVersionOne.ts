import { Router } from "express";
import BotRouter from "./routes/bots";
import WidgetsRouter from "./routes/widgets";

const router = Router();

router.use("/bots", BotRouter);
router.use("/widgets", WidgetsRouter);

router.get("/", (req, res) => {
  res.send(
    `You have reached the AIrtisan API. Refer to the <a href="https://docs.airtisan.app">documentation</a> for more information.`
  );
});

export default router;
