export const getShortenedMessage = (message) => {
  // if greater than 100 characters, shorten it
  if (message.length > 100) {
    return message.slice(0, 100) + "...";
  }
  return message;
};
