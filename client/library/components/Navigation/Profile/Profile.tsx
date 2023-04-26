import React, { useRef } from "react";
import styles from "./Profile.module.scss";
import {
  BellSimple,
  GearSix,
  Robot,
  SignOut,
  User,
} from "@phosphor-icons/react";
import { Menu } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../helpers/auth";

function Profile() {
  const navigate = useNavigate();

  const navRef = useRef<HTMLDivElement>(null);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0 && navRef.current) {
      navRef.current.classList.add(styles.scrolled);
    } else if (navRef.current) {
      navRef.current.classList.remove(styles.scrolled);
    }
  });

  return (
    <div className={styles.profileContainer} ref={navRef}>
      <Menu
        shadow="md"
        width={200}
        closeOnClickOutside
        closeOnItemClick
        position="bottom-end"
      >
        <Menu.Target>
          <div className={styles.Profile}>
            <User />
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Your Stuff</Menu.Label>

          <Menu.Item
            icon={<User />}
            onClick={() => {
              navigate("/profile");
            }}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            icon={<Robot />}
            onClick={() => {
              navigate("/profile?tab=bots");
            }}
          >
            Bots
          </Menu.Item>
          <Menu.Item
            icon={<BellSimple />}
            onClick={() => {
              navigate("/profile?tab=notifications");
            }}
          >
            Notifications
          </Menu.Item>
          <Menu.Item
            icon={<GearSix />}
            onClick={() => {
              navigate("/settings");
            }}
          >
            Settings
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>Actions</Menu.Label>

          <Menu.Item
            icon={<SignOut />}
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Menu.Item>

          {/* <Menu.Label>Danger zone</Menu.Label>

          <Menu.Item color="red" icon={<TrashSimple size={14} />}>
            Delete my account
          </Menu.Item> */}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}

export default Profile;
