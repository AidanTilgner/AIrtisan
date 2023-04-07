import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

const domContainer = document.querySelector("#root");
const root = createRoot(domContainer);

const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  window.location.href = "/login";
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
