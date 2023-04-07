import type { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { Logger } from "../utils/logger";
import { sendWarningEmail } from "../utils/email";
import { getRequesterInfo } from "../utils/analysis";
import { getAdmin } from "../database/functions/admin";
import { verifyAccessToken, verifyRefreshToken } from "../utils/crypto";
import { getApiKey } from "../database/functions/apiKey";

config();

const logger = new Logger({
  log_type: "warning",
  name: "authentication",
});

const isDev = process.env.NODE_ENV === "development";

export const checkAPIKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = (req.headers["x-api-key"] ||
    req.query["x-api-key"] ||
    req.headers["authorization"]?.split(" ")?.[1]) as string;

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
    // sendWarningEmail(
    //   "A request was made without a service specified.",
    //   getRequesterInfo(req)
    // );
    logger.log("A request was made without a service specified.");
    return;
  }

  const keyInDB = await getApiKey(service);

  if (!keyInDB) {
    res.status(401).send({
      message: "No API key found for the specified service.",
    });
    sendWarningEmail(
      "A request was made with a service that has no API key.",
      getRequesterInfo(req)
    );
    logger.log("A request was made with a service that has no API key.");
    return;
  }

  if (!keyInDB.compareKey(key)) {
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

export const checkIsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const access_token =
      (req.headers["x-access-token"] as string) ||
      (req.query["x-access-token"] as string) ||
      req.headers["authorization"]?.split(" ")?.[1];

    if (!access_token) {
      res.status(401).send({ message: "No access token provided." });
      return;
    }

    const { id } = verifyAccessToken(access_token) as { id: number };

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    req["admin"] = admin;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error." });
  }
};

export const checkIsSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const access_token =
      (req.headers["x-access-token"] as string) ||
      (req.query["x-access-token"] as string) ||
      req.headers["authorization"]?.split(" ")?.[1];

    if (!access_token) {
      res.status(401).send({ message: "No access token provided." });
      return;
    }

    const { id } = verifyAccessToken(access_token) as { id: number };

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    if (admin.role !== "superadmin") {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    req["admin"] = admin;

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal server error." });
    logger.log(err.message);
  }
};

export const checkIsAdminAndShowLoginIfNot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const access_token =
      (req.headers["x-access-token"] as string) ||
      (req.query["x-access-token"] as string) ||
      req.headers["authorization"]?.split(" ")?.[1];

    if (!access_token) {
      res.redirect("/login");
      return;
    }

    const { id } = verifyAccessToken(access_token) as { id: number };

    const admin = await getAdmin(id);

    if (!admin) {
      res.redirect("/login");
      return;
    }

    next();
  } catch (err) {
    res.redirect("/login");
  }
};
