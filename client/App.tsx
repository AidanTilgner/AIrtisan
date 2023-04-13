import React from "react";
import Navbar from "./library/components/Navigation/Navbar/Navbar";
import styles from "./App.module.scss";
import { Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import Preview from "./library/pages/Preview/Preview";
import Welcome from "./library/pages/Welcome/Welcome";
import Auth from "./library/pages/Auth/Auth";
import ReviewConversations from "./library/pages/Review/ReviewConversations";
import Training from "./library/pages/Training/";
import Corpus from "./library/pages/Corpus/Corpus";
import { useUser } from "./library/contexts/User";
import { ModalProvider } from "./library/contexts/Modals";
import GlobalModal from "./library/components/Utils/Modal";

function App() {
  const { isSuperAdmin } = useUser();

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
            <Navbar />
            <GlobalModal />
            <div className={styles.main_container}>
              <Routes>
                <Route path="/">
                  <Route index element={<Welcome />} />
                  <Route path="preview" element={<Preview />} />
                  <Route path="review">
                    <Route
                      path="conversations"
                      element={<ReviewConversations />}
                    />
                  </Route>
                  <Route path="train">
                    <Route index element={<Training />} />
                  </Route>
                  <Route path="corpus">
                    <Route index element={<Corpus />} />
                  </Route>
                  {isSuperAdmin && (
                    <Route path="admin">
                      <Route path="auth" element={<Auth />} />
                    </Route>
                  )}
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
