import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const domContainer = document.querySelector("#onyx-chat-rewire-root");

if (!domContainer) {
  throw new Error("No #onyx-chat-rewire-root element found");
}

const root = createRoot(domContainer);

root.render(<App />);
