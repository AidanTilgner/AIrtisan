import { Admin, Bot, Organization } from "../../documentation/main";

export const getShortenedMessage = (message: string) => {
  // if greater than 100 characters, shorten it
  if (message.length > 100) {
    return message.slice(0, 100) + "...";
  }
  return message;
};

export const getFormattedBotOwner = (bot: Bot) => {
  try {
    switch (bot.owner_type) {
      case "admin":
        return (bot.owner as Admin).username;
      case "organization":
        return (bot.owner as Organization).name;
      default:
        return "Unknown";
    }
  } catch (error) {
    console.error(error);
    return "Unknown";
  }
};
