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

function App() {
  const location = useLocation();

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
        <ModalProvider>
          <NotificationsProvider position="bottom-right">
            <TopNav />
            <GlobalModal />
            {!location.pathname.includes("/profile") && <ProfileNav />}
            <div className={styles.main_container}>
              <Routes>
                <Route path="/">
                  <Route index element={<Dashboard />} />
                </Route>
                <Route path="profile">
                  <Route index element={<Profile />} />
                </Route>
                <Route path="bots">
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
