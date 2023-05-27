export const validateJSON = (jsonString: string) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateJSONValuesAreStrings = (jsonString: string) => {
  try {
    const parsedJSON = JSON.parse(jsonString);
    const values = Object.values(parsedJSON);
    return values.every((value) => typeof value === "string");
  } catch (error) {
    return false;
  }
};
