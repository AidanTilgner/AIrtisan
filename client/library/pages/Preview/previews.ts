export const previews = [
  {
    name: "Rewire",
    hostedLocation: "https://vvibrant.dev",
    widgetJsFile: "/api/widgets/chatboxes/rewire-site.js",
    widgetCssFile: "/api/widgets/chatboxes/rewire-site.css",
    rootId: "onyx-chat-rewire-root",
  },
];

export const getPreview = (name: string) => {
  return previews.find((preview) => preview.name === name);
};

export const loadResourcesForPreview = async (name: string) => {
  const preview = getPreview(name);
  if (!preview) {
    return;
  }
  const widgetJsFile = await fetch(preview.widgetJsFile);
  const widgetCssFile = await fetch(preview.widgetCssFile);
  const widgetJs = await widgetJsFile.text();
  const widgetCss = await widgetCssFile.text();
  return {
    widgetJs,
    widgetCss,
  };
};

export const addResourceFilesToDocument = (
  widgetJs: string,
  widgetCss: string
) => {
  if (!widgetJs || !widgetCss) {
    return;
  }
  const script = document.createElement("script");
  script.innerHTML = widgetJs;
  document.body.appendChild(script);
  const style = document.createElement("style");
  style.innerHTML = widgetCss;
  document.body.appendChild(style);
};
