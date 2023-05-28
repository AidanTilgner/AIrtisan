import { NextFunction, Request, Response } from "express";
import { getBot, getBotBySlug } from "../../database/functions/bot";
import { Logger } from "../../utils/logger";
import { getApiKey } from "../../database/functions/apiKey";
import { Bot } from "../../database/models/bot";
import { config } from "dotenv";

config();

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
