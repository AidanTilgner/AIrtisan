import p, { Browser } from "puppeteer";

let browserInstance: Browser | null = null;
let closeTimeout: NodeJS.Timeout | null = null;
const COOLDOWN_PERIOD = 180000; // Cooldown period in milliseconds (1 minute)

export const closeBrowserInstance = async () => {
  if (browserInstance !== null) {
    await browserInstance.close();
    browserInstance = null;
  }
};

export const getBrowserInstance = async () => {
  if (browserInstance === null) {
    browserInstance = await p.launch({ headless: "new" });
  }
  if (closeTimeout !== null) {
    clearTimeout(closeTimeout);
  }

  closeTimeout = setTimeout(async () => {
    await closeBrowserInstance();
  }, COOLDOWN_PERIOD);

  return browserInstance;
};
export const getWebsitePageLinks = async (
  url: string,
  limit = 25,
  exclude: string[]
) => {
  try {
    const browser = await getBrowserInstance();
    const filteredExclude = exclude.filter(
      (exclusion) => !!exclusion && !(exclusion === " ")
    );
    const allLinks = await recursivelyTravelPageLinks(
      url,
      browser,
      limit,
      filteredExclude
    );
    return allLinks;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const extractDomain = (url: string) => {
  const withoutHttp = url.replace("https://", "").replace("http://", "");
  const formatted = withoutHttp.split(".").slice(-2).join(".");
  // remove endpoint
  const formattedWithoutEndpoint = formatted.split("/")[0];
  return formattedWithoutEndpoint;
};

export const isAFile = (url: string) => {
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  const isAFile = lastPart.includes(".");
  return isAFile;
};

export const endsWithHash = (url: string) => {
  const urlParts = url.split("/");
  const lastPart = urlParts[urlParts.length - 1];
  const endsWithHash = lastPart.includes("#");
  return endsWithHash;
};

export const matchesDomain = (urlOne: string, urlTwo: string) => {
  const urlOneDomain = extractDomain(urlOne);
  const urlTwoDomain = extractDomain(urlTwo);
  return urlOneDomain === urlTwoDomain;
};

export const matchesExclusion = (url: string, exclude: string[]) => {
  return exclude.some((exclusion) => url.includes(exclusion));
};

export const recursivelyTravelPageLinks = async (
  url: string,
  pup: Browser,
  limit = 25,
  exclude: string[] = [],
  visitedUrls: Set<string> = new Set()
) => {
  try {
    const allLinks: string[] = [];

    visitedUrls.add(url);

    const page = await pup.newPage();
    await page.goto(url);

    const links = await page.$$eval("a", (links) =>
      links.map((link) => link.href)
    );
    const usableLinks = links.filter((link) => {
      return (
        matchesDomain(url, link) &&
        !isAFile(link) &&
        !endsWithHash(link) &&
        !matchesExclusion(link, exclude)
      );
    });

    const remainingLimit = limit - allLinks.length;
    const limitedLinks = usableLinks.slice(0, remainingLimit);
    allLinks.push(...limitedLinks);

    for (const link of limitedLinks) {
      if (!visitedUrls.has(link) && allLinks.length < limit) {
        const subLinks = await recursivelyTravelPageLinks(
          link,
          pup,
          limit,
          exclude,
          visitedUrls
        );
        const remainingSubLimit = limit - allLinks.length;
        const limitedSubLinks = subLinks.slice(0, remainingSubLimit);
        allLinks.push(...limitedSubLinks);
      }
    }

    return allLinks.filter((link, index) => allLinks.indexOf(link) === index);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getPageTextContent = async (url: string) => {
  try {
    const browser = await p.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url);
    const textContent = await page.$eval("body", (el) => el.textContent);
    await browser.close();
    return textContent;
  } catch (error) {
    console.error(error);
    return "";
  }
};

export const getMultiplePageTextContent = async (urls: string[]) => {
  try {
    const browser = await p.launch({ headless: "new" });
    const page = await browser.newPage();
    const textContentArray: {
      url: string;
      content: string;
    }[] = [];
    for (const url of urls) {
      await page.goto(url);
      const textContent = await page.$eval("body", (el) => el.textContent);
      const links = await page.$$eval("a", (links) =>
        links.map((link) => link.href)
      );
      const content = `
      Text Content: ${textContent?.replace(/\n/g, "").replace(/ {2,}/g, " ")}\n

      Links:\n ${links.join("\n")}
      `;
      if (textContent) {
        textContentArray.push({
          url,
          content,
        });
      }
    }
    await browser.close();
    return textContentArray;
  } catch (error) {
    console.error(error);
    return [];
  }
};
