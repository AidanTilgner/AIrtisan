import prettier from "prettier";

export const prettify = (code: string) => {
  return prettier.format(code, {
    parser: "typescript",
    semi: true,
    singleQuote: true,
    trailingComma: "all",
  });
};

export const prettify_json = (code: string) => {
  return prettier.format(code, {
    parser: "json",
    singleQuote: false,
    trailingComma: "all",
  });
};
