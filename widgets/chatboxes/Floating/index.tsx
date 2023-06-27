import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./Floating";

const domContainer = () => {
  return document.getElementById("floating-airtisan-root");
};

if (!domContainer()) {
  const newDomContainer = document.createElement("div");
  newDomContainer.id = "floating-airtisan-root";
  document.body.appendChild(newDomContainer);
}

// add google fonts
const addGoogleFonts = () => {
  //  <link rel="preconnect" href="https://fonts.googleapis.com">
  {
    /* <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Quicksand:wght@300;400;500;600;700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">  */
  }
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = "https://fonts.googleapis.com";
  document.head.appendChild(link);

  const link2 = document.createElement("link");
  link2.rel = "preconnect";
  link2.href = "https://fonts.gstatic.com";
  link2.crossOrigin = "true";
  document.head.appendChild(link2);

  const link3 = document.createElement("link");
  link3.href =
    "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Quicksand:wght@300;400;500;600;700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap";
  link3.rel = "stylesheet";
  document.head.appendChild(link3);
};
addGoogleFonts();

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

const root = createRoot(domContainer() as HTMLElement);

root.render(<App />);
