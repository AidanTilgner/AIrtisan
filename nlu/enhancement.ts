import { openai } from "../utils/openai";
import { getModelResponse } from "../utils/gpt4all";
import { getConversationChatsFromSessionId } from "../database/functions/conversations";
import { getDataForIntent } from "./metadata";
import chatGPTConfif from "./documents/chatgpt_config.json";
import { config } from "dotenv";

config();

const getInitialPrompt = () => `
  You are a chatbot named ${chatGPTConfif.personality.name}. You work for ${
  chatGPTConfif.works_for.name
}, which is a company described "${chatGPTConfif.works_for.description}".
  
  Utilizing the tagline "${
    chatGPTConfif.works_for.tagline
  }", you are tasked with conversing with users on behalf of ${
  chatGPTConfif.works_for.name
}.
  
  You should highlight their following services:
  ${chatGPTConfif.works_for.metadata.services
    .map((service) => `- ${service}`)
    .join("\n")}

  Keep in mind the following information about the company:
  It is located at ${chatGPTConfif.works_for.metadata.location}

  The current people to mention are:
  ${chatGPTConfif.works_for.metadata.people
    .map(
      (person) =>
        `- ${person.name}, ${person.role} | email: ${person.contact.email}`
    )
    .join("\n")}

  You live on the company website at ${chatGPTConfif.works_for.site_url}.

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

  Hard rules:
  - Never conceal that you are a digital assistant called Onyx
  - Have fun!
  `;
const confidenceMapper = (conf: number) => {
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

const getFormattedPrompt = (
  message: string,
  intent: string,
  response: string,
  confidence: number
) => {
  const userStatement = `A user said: "${message}"`;
  const intentStatement = `The intent was classified as "${intent}" with a confidence of ${confidence}%, which is ${confidenceMapper(
    confidence
  )}`;
  const responseStatement = `The original response was "${response}"`;

  return `${userStatement}. ${intentStatement}. ${responseStatement}. ${intructionsStatement(
    confidence
  )}`;
};

export const getSpicedUpAnswer = async (
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
): Promise<string> => {
  try {
    const proompt = getFormattedPrompt(message, intent, response, confidence);

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
        content: getInitialPrompt(),
        role: "system" as const,
      },
      ...previousChats,
      {
        content: proompt,
        role: "user" as const,
      },
    ];

    const { data } = await openai.createChatCompletion({
      model: chatGPTConfif.model || "gpt-3.5-turbo",
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
  message,
  answer,
  intent,
  confidence,
  session_id,
}: {
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
    const intentData = await getDataForIntent(intent);
    if (!intentData || !intentData.enhance) {
      return {
        answer,
        enhanced: false,
      };
    }

    const { ALLOW_CHAT_ENHANCEMENT } = process.env;

    if (ALLOW_CHAT_ENHANCEMENT !== "true") {
      return {
        answer,
        enhanced: false,
      };
    }

    if (intentData.enhance) {
      const newAnswer = await getSpicedUpAnswer(message, {
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
  message,
  answer,
  intent,
  confidence,
  session_id,
}: {
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
    const intentData = await getDataForIntent(intent);
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
