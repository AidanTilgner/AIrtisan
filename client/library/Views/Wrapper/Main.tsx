import React from "react";
import { Outlet } from "react-router-dom";
import GlobalModal from "../../components/Utils/Modal";
import TopNav from "../../components/Navigation/Navbar/TopNav";
import ProfileNav from "../../components/Navigation/Profile/Profile";
import Spotlight from "../../components/Utils/Spotlight/Spotlight";
import styles from "./Main.module.scss";

function Main() {
  const topNavScrolled = location.pathname.includes("/bots/");
  return (
    <div className={styles.main}>
      <Spotlight>
        <TopNav alwaysScrolled={topNavScrolled} />
        <ProfileNav alwaysScrolled={topNavScrolled} />
        <GlobalModal />
        <Outlet />
      </Spotlight>
    </div>
  );
}

export default Main;
