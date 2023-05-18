import { Router } from "express";
import BotRouter from "./routes/bots";

const router = Router();

router.use("/bots", BotRouter);

router.get("/", (req, res) => {
  res.send(
    `You have reached the AIrtisan API. Refer to the <a href="https://docs.airtisan.app">documentation</a> for more information.`
  );
});

export default router;
