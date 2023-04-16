export const removeDuplicatesFromStrings = (strings: string[]) => {
  return strings.filter((item, index) => strings.indexOf(item) === index);
};

export const removeDuplicatesFromObjects = (objects: any[], key: string) => {
  return objects.filter(
    (item, index) =>
      objects.findIndex((obj) => obj[key] === item[key]) === index
  );
};
