import { Router } from "express";
import { getNLUResponse } from "../nlu";
import { checkAPIKey } from "../middleware/auth";

const router = Router();

router.use(checkAPIKey);

router.post("/say", async (req, res) => {
  const text = req.body.text || req.query.text;
  const botId = req.body.botId || req.query.botId;
  if (!text || !botId) {
    res.status(400).send({ message: "Missing text or botId." });
    return;
  }
  const response = await getNLUResponse(Number(botId), text);
  res.json(response);
});

export default router;
