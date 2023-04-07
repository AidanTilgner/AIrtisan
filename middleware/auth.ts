import type { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { Logger } from "../utils/logger";
import { sendWarningEmail } from "../utils/email";
import api_keys from "../api-keys.json";
import { getRequesterInfo } from "../utils/analysis";

config();

const logger = new Logger({
  log_type: "warning",
  name: "authentication",
});

const API_KEYS = api_keys;
const isDev = process.env.NODE_ENV === "development";

export const checkAPIKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isDev) {
    next();
    return;
  }
  const key =
    req.headers["x-api-key"] ||
    req.query["x-api-key"] ||
    req.headers["authorization"]?.split(" ")?.[1];

  if (!key) {
    res.status(401).send({ message: "No API key provided." });
    // sendWarningEmail(
    //   "A request was made without an API key.",
    //   getRequesterInfo(req)
    // );
    logger.log("A request was made without an API key.");
    return;
  }

  const service: string =
    (req.headers["x-service"] as string) || (req.query["x-service"] as string);

  if (!service) {
    res.status(401).send({
      message: "No service specified. Please specify request origin service.",
    });
    sendWarningEmail(
      "A request was made without a service specified.",
      getRequesterInfo(req)
    );
    logger.log("A request was made without a service specified.");
    return;
  }

  const expectedKey = API_KEYS[service];

  if (!expectedKey) {
    res.status(401).send({ message: "Invalid service provided." });
    sendWarningEmail(
      "A request was made with an invalid service",
      getRequesterInfo(req)
    );
    logger.log("A request was made with an invalid service.");
    return;
  }

  if (!(expectedKey === key)) {
    logger.log("Invalid API key provided");
    sendWarningEmail(
      "A request was made with an invalid API key.",
      getRequesterInfo(req)
    );
    res.status(401).send({ message: "Invalid API key provided." });
    return;
  }

  next();
};
