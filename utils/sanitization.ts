import { Logger } from "./logger";

const sanitizationLogger = new Logger({ name: "sanitization" });

export const getHIPAACompliantMessage = async (message: string) => {
  try {
    const sanitizedMessage = await identifyAndReplacePII(message);
    return {
      message: sanitizedMessage,
      sanitized: true,
    };
  } catch (error) {
    sanitizationLogger.error("Error sanitizing message: ", error);
    return {
      message,
      sanitized: false,
    };
  }
};

export const identifyAndReplacePII = async (message: string) => {
  try {
    const replacers = [emailReplacer, phoneReplacer, nameReplacer];
    let sanitizedMessage = message;
    replacers.forEach((replacer) => {
      const output = replacer(sanitizedMessage);
      if (output) {
        return (sanitizedMessage = output);
      }
      sanitizationLogger.error("Error sanitizing message: ", output);
    });
    return sanitizedMessage;
  } catch (error) {
    sanitizationLogger.error("Error sanitizing message: ", error);
    return null;
  }
};

export const emailReplacer = (message: string) => {
  try {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    const emailReplaced = message.replace(emailRegex, "[EMAIL EXPUNGED]");
    return emailReplaced;
  } catch (error) {
    sanitizationLogger.error("Error sanitizing message: ", error);
    return null;
  }
};

export const phoneReplacer = (message: string) => {
  try {
    const phoneRegex = /(\+?\d{1,2}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g;
    const phoneReplaced = message.replace(
      phoneRegex,
      "[PHONE NUMBER EXPUNGED]"
    );
    return phoneReplaced;
  } catch (error) {
    sanitizationLogger.error("Error sanitizing message: ", error);
    return null;
  }
};

export const nameReplacer = (message: string) => {
  try {
    const nameRegex = [/[A-Z][a-z]+ [A-Z][a-z]+/g];
    let nameReplaced = message;
    nameRegex.forEach((regex) => {
      nameReplaced = nameReplaced.replace(regex, "[NAME EXPUNGED]");
    });
    return nameReplaced;
  } catch (error) {
    sanitizationLogger.error("Error sanitizing message: ", error);
    return null;
  }
};
