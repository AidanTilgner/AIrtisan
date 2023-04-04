import { openai } from "../utils/openai";
import { getConversationChatsFromSessionId } from "../database/functions/conversations";
import { getDataForIntent } from "./metadata";
import chatGPTConfif from "./documents/chatgpt_config.json";

const getInitialPrompt = () => `
  You are a chatbot named ${chatGPTConfif.personality.name}. You work for ${
  chatGPTConfif.works_for.name
}, who is described as ${chatGPTConfif.works_for.description}.
  
  Utilizing the tagline "${
    chatGPTConfif.works_for.tagline
  }", you are tasked with conversing with users on behalf of ${
  chatGPTConfif.works_for.name
}.
  
  You should highlight his following skills:
  ${chatGPTConfif.works_for.metadata.skills
    .map((skill) => `- ${skill}`)
    .join("\n")}
  
  You live on his website at https://aidantilgner.dev.

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

const getFormattedPrompt = (
  message: string,
  intent: string,
  response: string,
  confidence: number
) => {
  const confidenceMapper = (conf: number) => {
    if (conf < 0.5) {
      return "low";
    }

    if (conf < 0.75) {
      return "medium";
    }

    return "high";
  };

  const userStatement = `A user said: "${message}"`;
  const intentStatement = `The intent was classified as "${intent}" with a confidence of ${confidence}%, which is ${confidenceMapper(
    confidence
  )}`;
  const responseStatement = `The original response was "${response}"`;
  const intructionsStatement = () => {
    if (confidence < 0.5) {
      return "Instructions: Please provide a response that makes sense in context, and sounds natural.";
    }

    if (confidence < 0.75) {
      return "Instructions: Please provide an enhanced, natural response based on the intent and the original response.";
    }

    return "Instructions: Please provide a variation on the original response, keeping in mind the intent.";
  };

  return `${userStatement}. ${intentStatement}. ${responseStatement}. ${intructionsStatement()}`;
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
) => {
  try {
    const proompt = getFormattedPrompt(message, intent, response, confidence);

    const conversationChats = await getConversationChatsFromSessionId(
      session_id
    );

    const previousChats = conversationChats.map((chat) => {
      return {
        content: chat.message,
        role: chat.role,
      };
    });

    const messages = [
      {
        content: getInitialPrompt(),
        role: "system" as "system",
      },
      ...previousChats,
      {
        content: proompt,
        role: "user" as "user",
      },
    ];

    const { data } = await openai.createChatCompletion({
      model: chatGPTConfif.model || "gpt-3.5-turbo",
      messages,
    });

    const choice = data.choices[0].message.content;

    return choice;
  } catch (err) {
    console.error(err);
    return message;
  }
};

export const enhanceChatIfNeccessary = async (
  answer: string,
  intent: string,
  confidence: number,
  session_id: string
): Promise<{
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
      const newAnswer = await getSpicedUpAnswer(answer, {
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
