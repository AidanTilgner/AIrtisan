import { Router } from "express";
import path from "path";
import { Request, Response, NextFunction } from "express";

const router = Router();

const cacheInvalidation = (req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
};

router.get("/chatboxes/:widget", cacheInvalidation, async (req, res) => {
  try {
    const file = req.params.widget;
    res.sendFile(
      path.join(process.cwd(), "public", "widgets", "chatboxes", file)
    );
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
});

export default router;
