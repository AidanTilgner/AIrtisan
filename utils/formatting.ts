export const extractDomain = (url: string) => {
  const withoutHttp = url.replace("https://", "").replace("http://", "");
  const formatted = withoutHttp.split(".").slice(-2).join(".");
  // remove endpoint
  const formattedWithoutEndpoint = formatted.split("/")[0];
  return formattedWithoutEndpoint;
};
