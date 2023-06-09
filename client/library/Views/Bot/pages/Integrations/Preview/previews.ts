export const previews = [
  {
    name: "Floating Widget",
    widgetJsFile: "/api/v1/widgets/chatboxes/floating-chat.js",
    widgetCssFile: "/api/v1/widgets/chatboxes/floating-chat.css",
    rootId: "floating-airtisan-root",
    inline: false,
    version: "Alpha",
    disclaimer:
      "This is a preview of the floating widget, a fully supported version is coming soon.",
    code: `
<script>
  window.AIrtisanSettings = {
    bot_slug: [your bot slug],
    bot_name: [your bot name],
  };
</script>
<script defer src="https://airtisan.app/api/v1/widgets/chatboxes/floating-chat.js"></script>

<!-- Optional: add this to the body of your html, and the widget will bind to it -->
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
};
