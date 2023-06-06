export const previews = [
  {
    name: "Floating Widget",
    widgetJsFile: "/api/widgets/chatboxes/floating-chat.js",
    widgetCssFile: "/api/widgets/chatboxes/floating-chat.css",
    rootId: "floating-airtisan-root",
    inline: false,
    disclaimer:
      "This is a preview of the floating widget, a fully supported version is coming soon.",
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
