import { openai } from "../utils/openai";

export const getGeneratedNameBasedOnContent = async (
  chats: {
    message: string;
    role: string;
  }[]
) => {
  try {
    const prompt = `
    You are an AI name generator. Which means the user will prompt you, and you will response with a, based on criteria.
    For example:
    The user says: "Please generate a name for a conversation where some chats are: "User - Hello", "Bot - Hi", "User - How are you?"
    
    You would say: "Greeting and introduction"

    Important criteria:
    - The name should be short
    - The name should be descriptive
    - Only respond with the name itself

    Please generate a name for a conversation where some chats are: ${chats
      .map((chat) => `"${chat.role} - ${chat.message}"`)
      .join(", ")}
        `;
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          content: prompt,
          role: "user",
        },
      ],
    });

    const generatedName = response.data.choices[0].message.content;

    const filteredGeneratedName = generatedName.replace('"', "");

    return filteredGeneratedName;
  } catch (err) {
    console.error(err);
    return null;
  }
};
