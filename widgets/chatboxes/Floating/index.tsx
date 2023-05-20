import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./Floating";

const domContainer = document.querySelector("#floating-airtisan-root");

if (!domContainer) {
  throw new Error("No #floating-airtisan-root element found");
}

const root = createRoot(domContainer);

root.render(<App />);
