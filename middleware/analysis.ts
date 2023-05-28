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

const performanceLogger = new Logger({
  log_file_path: "storage/analytics/performance.txt",
  name: "performance",
});

export const logIP = (req: Request, res: Response, next: NextFunction) => {
  if (isDev) {
    next();
    return;
  }
  const ip = getRequesterIp(req);
  anaylisLogger.analytics(`request from ip: ${ip}`);
  next();
};

export const logSession = (req: Request, res: Response, next: NextFunction) => {
  if (isDev) {
    next();
    return;
  }
  const session_id = getRequesterSessionId(req);
  anaylisLogger.analytics(`request from session: ${session_id}`);
  next();
};

export const addIPToSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isDev) {
    next();
    return;
  }
  const session_id = getRequesterSessionId(req);
  const session = getSessionIfExists(session_id);
  if (!session || !session_id) {
    const newSession = createSession(session_id);
    const reqIp = getRequesterIp(req);
    if (reqIp) {
      newSession.setIp(reqIp);
    }
    next();
    return;
  }
  const reqIp = getRequesterIp(req);
  if (reqIp) {
    session.setIpIfNotSet(reqIp);
  }
  next();
};

export const logPerformance = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on("finish", () => {
    const end = Date.now();
    const time = end - start;
    performanceLogger.info(`request to ${req.originalUrl} took ${time}ms`);
  });
  next();
};
