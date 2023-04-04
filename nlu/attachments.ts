import { getButtons } from "./metadata";

export const extractAttachments = async (text: string, intent: string) => {
  if (!text) return {};
  const linkData = extractLinks(text);
  const buttons = extractButtons(intent);
  return {
    links: linkData,
    buttons,
  };
};

export const extractLinks = (text: string) => {
  // find all <a> tags and their hrefs
  const links = text.match(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g);
  const linkData = links?.map((link) => {
    const href = link.match(/href="(.*?)"/)?.[1];
    const text = link.match(/>(.*?)</)?.[1];
    const domain = href?.match(/https?:\/\/(.*?)\//)?.[1];
    return { href, text, domain };
  });
  return linkData;
};

export const extractButtons = (intent: string) => {
  // match << __button.<button_type> >> in text
  const buttons = getButtons()[intent];
  const buttonData = buttons?.map((button) => {
    const metadata = button.metadata;
    const type = button.type;
    return { type, metadata };
  });

  return buttonData ? buttonData.filter((button) => button.type) : [];
};

export const filterAttachments = (text: string) => {
  // anything inside a << >> should be removed
  return text.replace(/<<.*?>>/g, "").trim();
};
