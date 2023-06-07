import "./typings.d.ts";
import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./library/contexts/User";
import { SearchProvider } from "./library/contexts/Search.js";

const accessToken = localStorage.getItem("accessToken");

if (!accessToken) {
  window.location.replace("https://www.airtisan.app");
}

const domContainer = document.querySelector("#root");

if (!domContainer) {
  throw new Error("No #root element found");
}

const root = createRoot(domContainer);

root.render(
  <BrowserRouter>
    <UserProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </UserProvider>
  </BrowserRouter>
);
