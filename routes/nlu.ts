import { Router } from "express";
import { getNLUResponse } from "../nlu";

const router = Router();

router.post("/say", async (req, res) => {
  const text = req.body.text || req.query.text;
  const response = await getNLUResponse(text);
  res.json(response);
});

export default router;
