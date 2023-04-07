import { GPT4All } from "gpt4all";
import { config } from "dotenv";

config();

let gpt4all: GPT4All;

export const initGPT = async (forceDownload: boolean) => {
  const gpt = new GPT4All("gpt4all-lora-unfiltered-quantized", forceDownload);

  const shouldDownload = process.env.FORCE_GPT4ALL_DOWNLOAD === "true";

  await gpt.init(shouldDownload);

  gpt4all = gpt;
  console.info("GPT4All initialized");
};

export const useGPT = async () => {
  return {
    open: gpt4all.open,
    prompt: gpt4all.prompt,
    close: gpt4all.close,
  };
};

export const getModelResponse = async (prompt: string) => {
  await gpt4all.open();
  const response = String(await gpt4all.prompt(prompt));
  gpt4all.close();
  return JSON.stringify(response);
};
