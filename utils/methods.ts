export const removeDuplicatesFromStrings = (strings: string[]) => {
  return strings.filter((item, index) => strings.indexOf(item) === index);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeDuplicatesFromObjects = (objects: any[], key: string) => {
  return objects.filter(
    (item, index) =>
      objects.findIndex((obj) => obj[key] === item[key]) === index
  );
};

export const getStringsAlphabetically = (strings: string[]) => {
  return strings.sort((a, b) => a.localeCompare(b));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getObjectsAlphabetically = (objects: any[], key: string) => {
  return objects.sort((a, b) => a[key].localeCompare(b[key]));
};
