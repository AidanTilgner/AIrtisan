import { NextFunction, Request, Response } from "express";
import {
  getBot,
  getBotBySlug,
  getBotModel,
} from "../../database/functions/bot";
import { Logger } from "../../utils/logger";
import { getApiKey } from "../../database/functions/apiKey";
import { Bot } from "../../database/models/bot";
import { extractDomain } from "../../utils/formatting";
import { config } from "dotenv";

config();

const isDev = process.env.NODE_ENV === "development";

const apiKeyLogger = new Logger({
  name: "API Key Middleware",
});

export const checkAPIKeyForBot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = (req.headers["x-api-key"] ||
    req.query["x-api-key"] ||
    req.headers["authorization"]?.split(" ")?.[1]) as string;

  if (!key) {
    res.status(401).send({ message: "No API key provided." });
    apiKeyLogger.log("A request was made without an API key.");
    return;
  }

  const service: string =
    (req.headers["x-service"] as string) || (req.query["x-service"] as string);

  if (!service) {
    res.status(401).send({
      message: "No service specified.",
    });
    // sendWarningEmail(
    //   "A request was made without a service specified.",
    //   getRequesterInfo(req)
    // );
    apiKeyLogger.log("A request was made without a service specified.");
    return;
  }

  const bot_id = Number(req.params.bot_id) || Number(req.query.bot_id);
  const bot_slug = String(req.params.bot_slug) || String(req.query.bot_slug);

  const bot = bot_id
    ? await getBot(bot_id)
    : bot_slug
    ? await getBotBySlug(bot_slug)
    : null;

  if (!bot) {
    res.status(401).send({
      message: "Bot not found.",
    });
    apiKeyLogger.log("A request was made with a bot ID that has no bot.");
    return;
  }

  const keyInDB = await getApiKey(service, bot.id);

  if (!keyInDB) {
    res.status(401).send({
      message: "No API key found for the specified service and bot.",
    });
    apiKeyLogger.log("A request was made with a service that has no API key.");
    return;
  }

  if (!keyInDB.compareKey(key)) {
    apiKeyLogger.log("Invalid API key provided");
    res.status(401).send({ message: "Invalid API key provided." });
    return;
  }

  (req as unknown as Record<"bot", Bot>).bot = bot;

  next();
};

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
      return;
    }

    const modelFile = await getBotModel(bot.id);

    if (!modelFile) {
      res.status(401).send({
        message: "No model file found for the specified bot.",
      });
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
    console.error(error);
    res
      .status(500)
      .send({ error: "There was an error completing your request." });
  }
};
