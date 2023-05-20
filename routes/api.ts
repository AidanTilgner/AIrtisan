import Express, { Router } from "express";
import { logIP } from "../middleware/analysis";
import OrganizationRouter from "./organizations";
import NLURouter from "./nlu";
import ChatRouter from "./chat";
import TrainingRouter from "./training";
import AuthRouter from "./auth";
import ConversationsRouter from "./conversations";
import WidgetsRouter from "./widgets";
import BotRouter from "./bots";
import AdminRouter from "./admin";
import ApiVersionOne from "../api/apiVersionOne";

const router = Router();

router.use(Express.json());
router.use(Express.urlencoded({ extended: true }));

router.use(logIP);

router.use("/organizations", OrganizationRouter);
router.use("/nlu", NLURouter);
router.use("/chat", ChatRouter);
router.use("/training", TrainingRouter);
router.use("/auth", AuthRouter);
router.use("/conversations", ConversationsRouter);
router.use("/widgets", WidgetsRouter);
router.use("/bots", BotRouter);
router.use("/admin", AdminRouter);
router.use("/v1", ApiVersionOne);

export default router;
