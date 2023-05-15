import { openai } from "../utils/openai";
import { getModelResponse } from "../utils/gpt4all";
import { getConversationChatsFromSessionId } from "../database/functions/conversations";
import { getDataForIntent, getIntentContextLoaded } from "./metadata";
import { getBot, getBotModel } from "../database/functions/bot";
import { config } from "dotenv";
import { Model } from "../types/lib";

config();

const getInitialPrompt = async (bot_id: number, model: Model) => {
  if (!model) {
    const bot = await getBot(bot_id, true);

    if (!bot) {
      return `
        You are a chatbot.
      `;
    }

    return `
      You are a chatbot named ${bot.name}.
    `;
  }

  return `
  You are a chatbot named ${model.personality.name}. You work for ${model.works_for.name}, which is a company described "${model.works_for.description}".
  
  Utilizing the tagline "${model.works_for.tagline}", you are tasked with conversing with users on behalf of ${model.works_for.name}.

  You should act as a normal assistant, but not hide that you are a robot.
  
  There is no need to be rude or offensive, but you should not be afraid to be blunt if you need to be.
  
  You should also not be afraid to be charismatic and funny.

  If you do not know the answer to a question, you should respond with something like:
  "I'm sorry, I don't know the answer to that question."

  If you do not know how to respond to a question, you should respond with something like:
  "I'm sorry, I don't know how to respond to that question."

  If you are asked a question which may be sensitive, or inappropriate, you should respond with something like:
  "I'm sorry, but I don't feel comfortable answering that question."

  Example Input:
  "A user said: 'Hello'. the intent was classified as 'greeting.hello' with a confidence of 80%, which is high. The original response was 'Hello, how can I help you today?'.
  Instructions: Please provide a variation on the original response, keeping in mind the intent."

  Example Output:
  "Hello, how can I help you on this wonderful day?"

  Be sure to carefully follow the instructions, and follow them carefully. They will tell you how much to adhere to the original response, and how much creative liberty you may take.
  `;
};
const confidenceMapper = (
  conf: number,
  none_fallback: boolean,
  intent: string
) => {
  if (none_fallback && intent.toLowerCase() === "none") {
    return "extremely low";
  }

  if (conf < 0.5) {
    return "low";
  }

  if (conf < 0.75) {
    return "medium";
  }

  return "high";
};

const intructionsStatement = (conf: number) => {
  if (conf < 0.5) {
    return "Instructions: Please provide a response that makes sense in context, and sounds natural.";
  }

  if (conf < 0.75) {
    return "Instructions: Please provide an enhanced, natural response based on the intent and the original response.";
  }

  return "Instructions: Please provide a variation on the original response, keeping in mind the intent.";
};

const getFormattedPrompt = async (
  message: string,
  intent: string,
  response: string,
  confidence: number,
  botId: number,
  none_fallback: boolean
) => {
  const userStatement = `A user said: "${message}"`;
  const intentStatement = `The intent was classified as "${intent}" with a confidence of ${confidence}%, which is ${confidenceMapper(
    confidence,
    none_fallback,
    intent
  )}`;
  const responseStatement = `The original response was "${response}"`;

  const contextLoaded = await getIntentContextLoaded(botId, intent);

  const noneFallbackDisclaimer =
    none_fallback && intent.toLowerCase() === "none"
      ? "This is a fallback 'none' intent, so you have free range to respond accordingly."
      : "";

  return `${userStatement}. ${intentStatement}. ${responseStatement}. ${intructionsStatement(
    confidence
  )}. ${noneFallbackDisclaimer}. Here is some additional context that might be helpful in formulating your answer: ${contextLoaded.join(
    ", "
  )}.`;
};

export const getSpicedUpAnswer = async (
  message: string,
  bot_id: number,
  {
    intent,
    response,
    session_id,
    confidence,
    none_fallback,
  }: {
    intent: string;
    response: string;
    session_id: string;
    confidence: number;
    none_fallback: boolean;
  }
): Promise<string> => {
  try {
    const modelFile = await getBotModel(bot_id);
    if (!modelFile) {
      return message;
    }

    const proompt = await getFormattedPrompt(
      message,
      intent,
      response,
      confidence,
      bot_id,
      none_fallback
    );

    const conversationChats = await getConversationChatsFromSessionId(
      session_id
    );

    if (!conversationChats) {
      return message;
    }

    const previousChats = conversationChats
      .map((chat) => {
        return {
          content: chat.message,
          role: chat.role,
        };
      })
      .slice(0, 4);

    const messages = [
      {
        content: await getInitialPrompt(bot_id, modelFile),
        role: "system" as const,
      },
      ...previousChats,
      {
        content: proompt,
        role: "user" as const,
      },
    ];

    const { data } = await openai.createChatCompletion({
      model: modelFile.specification.model || "gpt-3.5-turbo",
      messages,
      presence_penalty: 0.5,
    });

    const choice = data.choices[0]?.message?.content;

    if (!choice) {
      return message;
    }

    return choice;
  } catch (err) {
    console.error(err);
    return message;
  }
};

export const enhanceChatIfNecessary = async ({
  botId,
  message,
  answer,
  intent,
  confidence,
  session_id,
}: {
  botId: number;
  message: string;
  answer: string;
  intent: string;
  confidence: number;
  session_id: string;
}): Promise<{
  answer: string;
  enhanced: boolean;
}> => {
  try {
    const { ALLOW_CHAT_ENHANCEMENT } = process.env;

    if (ALLOW_CHAT_ENHANCEMENT !== "true") {
      return {
        answer,
        enhanced: false,
      };
    }

    const modelFile = await getBotModel(botId);

    if (!modelFile) {
      return {
        answer,
        enhanced: false,
      };
    }

    const {
      specification: { none_fallback },
    } = modelFile;

    const intentData = await getDataForIntent(botId, intent);

    if (!intentData && none_fallback) {
      const newAnswer = await getSpicedUpAnswer(message, botId, {
        intent,
        response: answer,
        session_id,
        confidence,
        none_fallback,
      });

      return {
        answer: newAnswer,
        enhanced: true,
      };
    }

    if (!intentData.enhance) {
      return {
        answer,
        enhanced: false,
      };
    }

    if (intentData.enhance) {
      const newAnswer = await getSpicedUpAnswer(message, botId, {
        intent,
        response: answer,
        session_id,
        confidence,
        none_fallback,
      });

      return {
        answer: newAnswer,
        enhanced: true,
      };
    }

    return {
      answer,
      enhanced: false,
    };
  } catch (err) {
    console.error(err);
    return {
      answer,
      enhanced: false,
    };
  }
};

export const getGpt4AllPrompt = async (
  message: string,
  answer: string,
  intent: string,
  confidence: number
) => {
  return `
  ${message}
  `;
};

export const getSpicedUpAnswerWithGPT4All = async (
  message: string,
  {
    intent,
    response,
    session_id,
    confidence,
  }: {
    intent: string;
    response: string;
    session_id: string;
    confidence: number;
  }
) => {
  try {
    const useablePrompt = await getGpt4AllPrompt(
      message,
      response,
      intent,
      confidence
    );

    const generatedResponse = await getModelResponse(useablePrompt);

    return generatedResponse;
  } catch (err) {
    console.error(err);
    return message;
  }
};

export const enhanceChatIfNecessaryWithGPT4All = async ({
  botId,
  message,
  answer,
  intent,
  confidence,
  session_id,
}: {
  botId: number;
  message: string;
  answer: string;
  intent: string;
  confidence: number;
  session_id: string;
}): Promise<{
  answer: string;
  enhanced: boolean;
}> => {
  try {
    const intentData = await getDataForIntent(botId, intent);
    if (!intentData || !intentData.enhance) {
      return {
        answer,
        enhanced: false,
      };
    }

    if (intentData.enhance) {
      const newAnswer = await getSpicedUpAnswerWithGPT4All(message, {
        intent,
        response: answer,
        session_id,
        confidence,
      });

      return {
        answer: newAnswer,
        enhanced: true,
      };
    }

    return {
      answer,
      enhanced: false,
    };
  } catch (err) {
    console.error(err);
    return {
      answer,
      enhanced: false,
    };
  }
};
