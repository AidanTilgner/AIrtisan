import type { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";
import { config } from "dotenv";
import { getRequesterIp, getRequesterSessionId } from "../utils/analysis";
import { createSession, getSessionIfExists } from "../sessions";

config();

const isDev = process.env.NODE_ENV === "development";

const anaylisLogger = new Logger({
  log_file_path: "storage/analytics/analysis.txt",
  name: "analysis",
});

export const logIP = (req: Request, res: Response, next: NextFunction) => {
  const ip = getRequesterIp(req);
  anaylisLogger.analytics(`request from ip: ${ip}`);
  next();
};

export const logSession = (req: Request, res: Response, next: NextFunction) => {
  const session_id = getRequesterSessionId(req);
  anaylisLogger.analytics(`request from session: ${session_id}`);
  next();
};

export const addIPToSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session_id = getRequesterSessionId(req);
  const session = getSessionIfExists(session_id);
  if (!session) {
    const newSession = createSession(session_id);
    newSession.setIp(getRequesterIp(req));
    next();
    return;
  }
  session.setIpIfNotSet(getRequesterIp(req));
  next();
};
