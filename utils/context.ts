import { makeChatCompletionRequest } from "./openai";
import { getMultiplePageTextContent } from "./puppeteer";
import type { ChatCompletionRequestMessage } from "openai";
import { validateJSON, validateJSONValuesAreStrings } from "./validation";

export const handleBuildContextObjectForPages = async (pages: string[]) => {
  try {
    const allTextContent = await getMultiplePageTextContent(pages);

    const contextObjects: Record<string, unknown>[] = [];

    for (const { url, content } of allTextContent) {
      const contextObject = await getContextObjectForContent(url, content);
      if (!contextObject) continue;
      contextObjects.push(contextObject);
    }

    const contextObject = contextObjects.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    return contextObject;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const ALLOWED_CONTENT_RETRIES = 2;

export const getContextObjectForContent = async (
  url: string,
  textContent: string,
  retries = 0
): Promise<Record<string, unknown> | null> => {
  try {
    if (retries > ALLOWED_CONTENT_RETRIES) {
      console.error(
        "Exceeded maximum number of retries for getting context object for content on page: ",
        url
      );
      return null;
    }

    const systemPrompt = getDefaultPromptForPage();
    const userPrompt = getPromptForContent(textContent);

    const messages: ChatCompletionRequestMessage[] = [
      {
        content: systemPrompt,
        role: "system",
      },
      {
        content: userPrompt,
        role: "user",
      },
    ];

    const llmResponse = await makeChatCompletionRequest(messages);

    if (!llmResponse) {
      console.error("No response from LLM, retrying...");
      return (
        (await getContextObjectForContent(url, textContent, retries + 1)) ||
        null
      );
    }

    const isValidJSON =
      validateJSON(llmResponse) && validateJSONValuesAreStrings(llmResponse);

    if (!isValidJSON) {
      console.error("Invalid JSON response from LLM, retrying...");
      return (
        (await getContextObjectForContent(url, textContent, retries + 1)) ||
        null
      );
    }

    const contextObject = JSON.parse(llmResponse) as Record<string, unknown>;

    return contextObject;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getDefaultPromptForPage = () => {
  return `
  You are a data structuring bot. What this means is that you will be given unstructured data, and your job is to structure it into a valid JSON object.

  Because this JSON will be used by other bots, it should still encorporate natural language. For example, take the following text:

  "John Doe is 32 years old. He lives in New York City. And he works as a software engineer."

  This should be structured into the following JSON:

  {
    "john doe full name": "John Doe's full name is John Doe",
    "john doe age": "John Doe is 32",
    "jogn doe localtion": "John Doe lives in New York City",
    "john doe job title": "John Doe is a software engineer",
    "john doe description": "John Doe is 32 years old, he lives in New York City, and he works as a software engineer."
  }

  Or, take the following text:

  "Links: https://www.google.com, https://www.facebook.com, https://www.twitter.com"

  This should be structured into the following JSON:

  {
    "google link": "https://www.google.com",
    "facebook link": "https://www.facebook.com",
    "twitter link": "https://www.twitter.com",
    "some important links": "Some important links: https://www.google.com, https://www.facebook.com, https://www.twitter.com"
  }

  Note that the JSON key is a description of the data, and the value is the data itself, which should emphasize natural language.

  Also, keep in mind that the JSON you return is up to you, however, there are some key information types that you should try to look for.

  These are:
  - Names
  - Locations
  - Dates
  - Links
  - Contact Information
  - Services

  This is because the JSON context will be used to inform chatbots so that they can better represent their clients.

  Hard Rules:
  - Only return JSON.
  - The JSON you return should be valid JSON.
  - The key will be a description of the data, and the value will be the data itself, which should emphasize natural language.
  - The VALUES SHOULD NEVER BE OBJECTS OR ARRAYS, and should only be strings.
  `;
};

export const getPromptForContent = (content: string) => {
  return `
    Here is some data:

    ${content}
    `;
};
