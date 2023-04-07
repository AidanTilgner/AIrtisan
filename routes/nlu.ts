import { Router } from "express";
import { getNLUResponse } from "../nlu";
import { checkAPIKey } from "../middleware/auth";

const router = Router();

router.use(checkAPIKey);

router.post("/say", async (req, res) => {
  const text = req.body.text || req.query.text;
  const response = await getNLUResponse(text);
  res.json(response);
});

export default router;
