import React from "react";
import styles from "./App.module.scss";
import { Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalProvider } from "./library/contexts/Modals";
import Bot from "./library/Views/Bot/Bot";
import Dashboard from "./library/Views/Dashboard/Dashboard";
import Profile from "./library/Views/Profile/Profile";
import Organization from "./library/Views/Organization/Organization";
import Settings from "./library/Views/Settings/Settings";
import Fallback from "./library/Views/ErrorPages/Fallback";
import InviteUser from "./library/Views/Organization/InviteUser";
import CreateOrganization from "./library/Views/Organization/Create";
import CreateBot from "./library/Views/Bot/Create";
import Main from "./library/Views/Wrapper/Main";
import Feedback from "./library/Views/Feedback/Feedback";
import "./Global.scss";

function App() {
  return (
    <div className={styles.App}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
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
        <ModalProvider>
          <Notifications position="bottom-right" />
          <div className={styles.main_container}>
            <Routes>
              <Route path="/" element={<Main />}>
                <Route index element={<Dashboard />} />
                <Route path="404" element={<Fallback />} />
                <Route path="settings">
                  <Route index element={<Settings />} />
                </Route>
                <Route path="feedback">
                  <Route index element={<Feedback />} />
                </Route>
                <Route path="profile">
                  <Route path=":username">
                    <Route index element={<Profile />} />
                  </Route>
                </Route>
                <Route path="organizations">
                  <Route path="create" element={<CreateOrganization />} />
                  <Route path=":organization_id">
                    <Route index element={<Organization />} />
                    <Route path="invite" element={<InviteUser />} />
                  </Route>
                </Route>
                <Route path="bots">
                  <Route path="create" element={<CreateBot />} />
                  <Route path=":bot_id">
                    <Route index element={<Bot />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </div>
        </ModalProvider>
      </MantineProvider>
    </div>
  );
}

export default App;
