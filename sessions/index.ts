import { v4 as uuid4 } from "uuid";

class Session {
  public id: string;
  public ip!: string;
  constructor(id?: string | undefined | null) {
    this.id = id || uuid4();
  }

  public setIp(ip: string) {
    this.ip = ip;
  }

  public setIpIfNotSet(ip: string) {
    if (!this.ip) {
      this.ip = ip;
    }
  }

  public getIpIfSet(): string | null {
    return this.ip || null;
  }
}

const sessions: { [key: string]: Session } = {};

export const createSession = (id?: string | undefined | null) => {
  const session = new Session(id);
  sessions[session.id] = session;
  return session;
};

export const getSession = (id: string) => {
  return sessions[id];
};

export const getSessionIfExists = (
  id: string | undefined | null
): Session | null => {
  if (!id) {
    return null;
  }
  return sessions[id] || null;
};
