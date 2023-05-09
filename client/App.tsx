import React from "react";
import styles from "./App.module.scss";
import { Routes, Route, useLocation } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalProvider } from "./library/contexts/Modals";
import GlobalModal from "./library/components/Utils/Modal";
import Bot from "./library/Views/Bot/Bot";
import Dashboard from "./library/Views/Dashboard/Dashboard";
import ProfileNav from "./library/components/Navigation/Profile/Profile";
import Profile from "./library/Views/Profile/Profile";
import TopNav from "./library/components/Navigation/Navbar/TopNav";
import Organization from "./library/Views/Organization/Organization";
import Settings from "./library/Views/Settings/Settings";
import Fallback from "./library/Views/ErrorPages/Fallback";
import InviteUser from "./library/Views/Organization/InviteUser";
import CreateOrganization from "./library/Views/Organization/Create";
import CreateBot from "./library/Views/Bot/Create";

function App() {
  const location = useLocation();

  const topNavScrolled = location.pathname.includes("/bots/");

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
          <NotificationsProvider position="bottom-right">
            <div className={styles.main_container}>
              <TopNav alwaysScrolled={topNavScrolled} />
              <GlobalModal />
              <ProfileNav />
              <Routes>
                <Route path="/">
                  <Route index element={<Dashboard />} />
                  <Route path="404" element={<Fallback />} />
                </Route>
                <Route path="settings">
                  <Route index element={<Settings />} />
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
              </Routes>
            </div>
          </NotificationsProvider>
        </ModalProvider>
      </MantineProvider>
    </div>
  );
}

export default App;
