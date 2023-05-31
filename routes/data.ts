import Express, { Router } from "express";
import path from "path";

const router = Router();

router.use(Express.static(path.join("public", "data")));

export default router;
