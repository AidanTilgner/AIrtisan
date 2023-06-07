export const previews = [
  {
    name: "Floating Widget",
    widgetJsFile:
      "https://airtisan.app/api/v1/widgets/chatboxes/floating-chat.js",
    widgetCssFile:
      "https://airtisan.app/api/v1/widgets/chatboxes/floating-chat.css",
    rootId: "floating-airtisan-root",
    inline: false,
    disclaimer:
      "This is a preview of the floating widget, a fully supported version is coming soon.",
    code: `
<script>
  window.AIrtisanSettings = {
    airtisan_bot_slug: [your bot slug],
    airtisan_bot_name: [your bot name],
  };
</script>
<script src="https://airtisan.app/api/v1/widgets/chatboxes/floating-chat.js"></script>
<link rel="stylesheet" href="https://airtisan.app/api/v1/widgets/chatboxes/floating-chat.css" />

<!-- This is the root element for the widget, put it somewhere in your html -->
<div id="floating-airtisan-root"></div>
    `,
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
