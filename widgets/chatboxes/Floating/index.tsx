import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./Floating";

const domContainer = document.querySelector("#floating-airtisan-root");

if (!domContainer) {
  throw new Error("No #floating-airtisan-root element found");
}

const AIrtisanSettings = (window as unknown as SettingsWindow).AIrtisanSettings;

const addStyles = async () => {
  const exists = document.getElementById("floating-chat-styles");
  if (exists) return;
  const addingCurrently =
    (window as unknown as Record<string, boolean>).addingStyles === true;
  if (addingCurrently) return;
  const foundUrl = AIrtisanSettings.api_url;
  const foundUrlToUse = foundUrl
    ? foundUrl + "/widgets/chatboxes/floating-chat.css"
    : `https://airtisan.app/api/v1/widgets/chatboxes/floating-chat.css`;
  (window as unknown as Record<string, boolean>).addingStyles = true;
  const cssFile = await fetch(foundUrlToUse);
  const cssText = await cssFile.text();
  const style = document.createElement("style");
  style.id = "airtisan-floating-chat-styles";
  style.innerHTML = cssText;
  document.body.appendChild(style);
};
addStyles();

const root = createRoot(domContainer);

root.render(<App />);
