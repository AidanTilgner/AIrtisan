import type { Request } from "express";

export const getRequesterInfo = (req: Request) => {
  // get things like ip, user agent, etc.
  // return an object with the info

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const session_id = req.body.session_id || req.query.session_id;

  return {
    ip,
    userAgent,
    session_id,
  };
};

export const getRequesterSessionId = (req: Request): string | null => {
  const session_id: string =
    req.query.session_id || req.headers["x-session_id"] || req.body.session_id;

  return session_id || null;
};

export const getRequesterIp = (req: Request | null | undefined) => {
  if (!req || !req.headers) {
    return null;
  }
  const ip: string | null | undefined =
    (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;

  return ip;
};
