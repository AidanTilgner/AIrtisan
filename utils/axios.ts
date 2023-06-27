import { config } from "dotenv";
import axios, { AxiosInstance } from "axios";
import { Logger } from "./logger";

config();

const onyxCoreLogger = new Logger({ name: "OnyxCore" });

const onyxCoreHost = process.env.ONYX_CORE_HOST;
const onyxCoreApiKey = process.env.ONYX_CORE_API_KEY || "test";

export const onyxCore = axios.create({
  baseURL: onyxCoreHost,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-service": "onyxchat",
    "x-key": onyxCoreApiKey,
  },
});

export const useOnyxCore = (): AxiosInstance | null => {
  if (!onyxCoreHost) {
    onyxCoreLogger.info(
      "No Onyx Core host specified, no Onyx Core requests will be made"
    );
    return null;
  }

  return onyxCore;
};
