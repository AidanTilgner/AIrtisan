import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(config);
