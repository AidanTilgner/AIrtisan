import { NextFunction, Request, Response } from "express";
import {
  getBot,
  getBotBySlug,
  getBotModel,
} from "../../database/functions/bot";
import { Logger } from "../../utils/logger";
import { config } from "dotenv";
import { extractDomain } from "../../utils/formatting";

config();

const botLogger = new Logger({
  name: "API V1 Bot Middleware",
});

const isDev = process.env.NODE_ENV === "development";

export const validateDomainForBot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const botID = req.body.bot_id || req.query.bot_id || req.params.bot_id;
    const botSlug =
      req.body.bot_slug || req.query.bot_slug || req.params.bot_slug;
    const domain = req.headers.origin || req.headers.host;

    if (isDev) {
      next();
      return;
    }

    if (domain === process.env.CURRENT_DOMAIN) {
      next();
      return;
    }

    if (!domain) {
      res.status(401).send({
        message: "No domain provided.",
      });
      return;
    }

    if (!botID && !botSlug) {
      res.status(401).send({
        message: "No bot ID or slug provided.",
      });
      return;
    }

    const bot = botID ? await getBot(botID) : await getBotBySlug(botSlug);

    if (!bot) {
      res.status(401).send({
        message: "Bot not found.",
      });
      botLogger.log("A request was made with a bot ID that has no bot.");
      return;
    }

    const modelFile = await getBotModel(bot.id);

    if (!modelFile) {
      res.status(401).send({
        message: "No model file found for the specified bot.",
      });
      botLogger.log("A request was made with a bot ID that has no model file.");
      return;
    }

    const domains = modelFile.security.domain_whitelist || [];

    const extractedDomain = extractDomain(domain);

    const domainsMatch = domains.some((d) => {
      return d === extractedDomain;
    });

    if (!domainsMatch) {
      res.status(401).send({
        message: "Unauthorized.",
      });
      return;
    }

    next();
  } catch (error) {
    botLogger.error("Error validating domain for bot.", error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
};

export const validateAllowingWidgetsForBot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const botID = req.body.bot_id || req.query.bot_id || req.params.bot_id;
    const botSlug =
      req.body.bot_slug || req.query.bot_slug || req.params.bot_slug;

    if (isDev) {
      next();
      return;
    }

    if (!botID && !botSlug) {
      res.status(401).send({
        message: "No bot ID or slug provided.",
      });

      return;
    }

    const bot = botID ? await getBot(botID) : await getBotBySlug(botSlug);

    if (!bot) {
      res.status(401).send({
        message: "Bot not found.",
      });
      botLogger.log("A request was made with a bot ID that has no bot.");
      return;
    }

    const modelFile = await getBotModel(bot.id);

    if (!modelFile) {
      res.status(401).send({
        message: "No model file found for the specified bot.",
      });
      return;
    }

    const allowWidgets = modelFile.security.allow_widgets;

    if (!allowWidgets) {
      res.status(401).send({
        message: "Unauthorized.",
      });
      return;
    }

    next();
  } catch (error) {
    botLogger.error("Error validating domain for bot.", error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
};
