import React from "react";
import { Outlet } from "react-router-dom";
import GlobalModal from "../../components/Utils/Modal";
import TopNav from "../../components/Navigation/Navbar/TopNav";
import ProfileNav from "../../components/Navigation/Profile/Profile";

function Main() {
  const topNavScrolled = location.pathname.includes("/bots/");
  return (
    <div>
      <TopNav alwaysScrolled={topNavScrolled} />
      <ProfileNav alwaysScrolled={topNavScrolled} />
      <GlobalModal />
      <Outlet />
    </div>
  );
}

export default Main;
