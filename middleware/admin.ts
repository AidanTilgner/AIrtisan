import { config } from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";
import { verifyAccessToken } from "../utils/crypto";
import { getAdmin } from "../database/functions/admin";
import { Admin } from "../database/models/admin";

config();

const logger = new Logger({
  name: "Admin Middleware",
});

export const checkAdminIsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminIdTryingToAccess =
      req.params.admin_id || req.body.admin_id || req.query.admin_id;

    const access_token =
      (req.headers["x-access-token"] as string) ||
      (req.query["x-access-token"] as string) ||
      req.headers["authorization"]?.split(" ")?.[1];

    if (!access_token) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    const verified = (await verifyAccessToken(access_token)) as
      | { id: number }
      | false;

    if (!verified) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    const { id } = verified;

    const actualAdmin = await getAdmin(id, true);

    if (!actualAdmin) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    (req as unknown as Record<"admin", Admin>)["admin"] = actualAdmin as Admin;

    if (actualAdmin?.role === "superadmin") {
      next();
      return;
    }

    if (actualAdmin.id !== Number(adminIdTryingToAccess)) {
      res.status(401).send({ message: "Unauthorized." });
      return;
    }

    next();
  } catch (error) {
    logger.error("Error checking if admin is admin.", error);
    res.status(500).send({ message: "Internal server error." });
  }
};
