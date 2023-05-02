import type { Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import { Logger } from "../utils/logger";
import { sendWarningEmail } from "../utils/email";
import { getRequesterInfo } from "../utils/analysis";
import { getAdmin } from "../database/functions/admin";
import { verifyAccessToken } from "../utils/crypto";
import { getApiKey } from "../database/functions/apiKey";
import {
  checkAdminIsInOrganization,
  checkAdminIsOwnerOfOrganization,
  getOrganization,
} from "../database/functions/organization";
import { checkAdminHasAccessToBot, getBot } from "../database/functions/bot";
import { Admin } from "../database/models/admin";
import { Organization } from "../database/models/organization";
import { Bot } from "../database/models/bot";

config();

const logger = new Logger({
  log_type: "warning",
  name: "authentication",
});

export const checkAPIKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const key = (req.headers["x-api-key"] ||
    req.query["x-api-key"] ||
    req.headers["authorization"]?.split(" ")?.[1]) as string;

  const bot_id = Number(req.params.bot_id) || Number(req.query.bot_id);

  const bot = await getBot(bot_id);

  if (!bot) {
    res.status(401).send({
      message: "No bot found for the specified bot ID.",
    });
    logger.log("A request was made with a bot ID that has no bot.");
    return;
  }

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

  const keyInDB = await getApiKey(service, bot.id);

  console.log("Key in DB: ", keyInDB);

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

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { id } = verified;

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    (req as unknown as Record<"admin", Admin>)["admin"] = admin;

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

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { id } = verified;

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    if (admin.role !== "superadmin") {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    (req as unknown as Record<"admin", Admin>)["admin"] = admin;

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal server error." });
    logger.log(String(err));
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

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.redirect("/login");
      return;
    }

    const { id } = verified;

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

export const isInOrganization = async (
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

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { id } = verified;

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { organization } = req.params;

    if (!organization) {
      res.status(400).send({ message: "No organization provided." });
      return;
    }

    const org = await getOrganization(Number(organization));

    if (!org) {
      res.status(400).send({ message: "Invalid organization provided." });
      return;
    }

    const isMember = await checkAdminIsInOrganization(admin.id, org.id);

    if (!isMember) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    (req as unknown as Record<"admin", Admin>)["admin"] = admin;
    (req as unknown as Record<"organization", Organization>)["organization"] =
      org;

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal server error." });
    logger.log(String(err));
  }
};

export const isOwnerOfOrganization = async (
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

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { id } = verified;

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { id: organization } = req.params;

    if (!organization) {
      res.status(400).send({ message: "No organization provided." });
      return;
    }

    const org = await getOrganization(Number(organization));

    if (!org) {
      res.status(400).send({ message: "Invalid organization provided." });
      return;
    }

    const isOwner = await checkAdminIsOwnerOfOrganization(org.id, admin.id);

    if (!isOwner) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    (req as unknown as Record<"admin", Admin>)["admin"] = admin;
    (req as unknown as Record<"organization", Organization>)["organization"] =
      org;

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal server error." });
    logger.log(String(err));
  }
};

export const hasAccessToBot = async (
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

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const { id } = verified;

    const admin = await getAdmin(id);

    if (!admin) {
      res.status(401).send({ message: "Invalid access token provided." });
      return;
    }

    const bot_id = req.params.bot_id || req.body.bot_id || req.query.bot_id;

    if (!bot_id) {
      res.status(400).send({ message: "No bot id provided." });
      return;
    }

    const bot = await getBot(bot_id);

    if (!bot) {
      res.status(400).send({ message: "Invalid bot id provided." });
      return;
    }

    const hasAccess = await checkAdminHasAccessToBot(admin.id, bot_id);

    if (!hasAccess) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    (req as unknown as Record<"admin", Admin>)["admin"] = admin;
    (req as unknown as Record<"bot", Bot>)["bot"] = bot;

    next();
  } catch (err) {
    res.status(500).send({ message: "Internal server error." });
    logger.log(String(err));
  }
};
