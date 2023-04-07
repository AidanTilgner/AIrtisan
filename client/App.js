import React from "react";
import Navbar from "./library/components/Navigation/Navbar/Navbar";
import withStyles from "react-css-modules";
import styles from "./App.module.scss";
import { Routes, Route } from "react-router-dom";
import Interactive from "./library/pages/Interactive/Interactive";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import Preview from "./library/pages/Preview/Preview";
import Welcome from "./library/pages/Welcome/Welcome";

function App() {
  return (
    <div className={styles.App}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          headings: {
            fontFamily: "Quicksand",
            fontWeight: 500,
          },
          colors: {
            cool_blue: [
              "#f2f3f7",
              "#d5d9e8",
              "#b7c0dd",
              "#97a7d8",
              "#758ed9",
              "#4e73e1",
              "#2256f2",
              "#2450d5",
              "#3050d5",
              "#3050af",
            ],
          },
          primaryColor: "cool_blue",
          fontFamily: "Quicksand",
        }}
      >
        <NotificationsProvider position="bottom-right">
          <Navbar />
          <Routes>
            <Route path="/">
              <Route index element={<Welcome />} />
              <Route path="interactive" element={<Interactive />} />
              <Route path="preview" element={<Preview />} />
            </Route>
          </Routes>
        </NotificationsProvider>
      </MantineProvider>
    </div>
  );
}

export default withStyles(styles)(App);
