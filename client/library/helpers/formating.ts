import { Admin, Bot, Organization } from "../../documentation/main";

export const getShortenedMessage = (message: string) => {
  // if greater than 100 characters, shorten it
  if (message.length > 100) {
    return message.slice(0, 100) + "...";
  }
  return message;
};

export const getFormattedBotOwner = (bot: Bot | undefined | null) => {
  if (!bot) return "Unknown";

  try {
    if (!bot.owner) return "Unknown";
    switch (bot.owner_type) {
      case "admin":
        return (
          (bot.owner as Admin).display_name || (bot.owner as Admin).username
        );
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

export const getFormattedAdminName = (admin: Admin) => {
  try {
    const name = admin.display_name || admin.username || admin.email;
    return name;
  } catch (error) {
    console.error(error);
    return "Unknown";
  }
};

export const getFormattedDate = (date: string | Date) => {
  const newDate = new Date(date);
  return newDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
