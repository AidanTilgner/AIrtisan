import { openai } from "../utils/openai";

export const getGeneratedNameBasedOnContent = async (
  chats: {
    message: string;
    role: string;
  }[]
) => {
  try {
    const prompt = `Write a short sentence in past tense that describes the users intent in this conversation: : ${chats
      .map((chat) => `${chat.role}:"${chat.message}"`)
      .join(", ")}-`;
    const response = await openai.createCompletion({
      model: "text-curie-001",
      prompt: prompt,
      temperature: 0.6,
    });

    const generatedName = response.data.choices[0].text;

    const filteredGeneratedName = generatedName
      .replace('"', "")
      .replace('"', "");

    return filteredGeneratedName;
  } catch (err) {
    console.error(err);
    return null;
  }
};
