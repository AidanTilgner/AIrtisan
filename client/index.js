import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./library/contexts/User";

const domContainer = document.querySelector("#root");
const root = createRoot(domContainer);

root.render(
  <BrowserRouter>
    <UserProvider>
      <App />
    </UserProvider>
  </BrowserRouter>
);
