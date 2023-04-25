import React from "react";
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

  return (
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
            navigate("/profile?tab=overview");
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
          icon={<GearSix />}
          onClick={() => {
            navigate("/profile?tab=settings");
          }}
        >
          Settings
        </Menu.Item>
        <Menu.Item
          icon={<BellSimple />}
          onClick={() => {
            navigate("/profile?tab=notifications");
          }}
        >
          Notifications
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
  );
}

export default Profile;
