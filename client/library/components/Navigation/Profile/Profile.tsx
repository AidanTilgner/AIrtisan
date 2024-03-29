import React, { useRef } from "react";
import styles from "./Profile.module.scss";
import {
  BellSimple,
  Buildings,
  // GearSix,
  Robot,
  SignOut,
  User,
  MegaphoneSimple,
  Shield,
  Clipboard,
  GearSix,
} from "@phosphor-icons/react";
import { Menu } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../helpers/auth";
import { useUser } from "../../../contexts/User";
import Disclaimer from "../../Utils/Disclaimer/Disclaimer";

function Profile({ alwaysScrolled }: { alwaysScrolled?: boolean }) {
  const navigate = useNavigate();

  const { user, isSuperAdmin } = useUser();

  const navRef = useRef<HTMLDivElement>(null);

  window.addEventListener("scroll", () => {
    if (alwaysScrolled) return;
    if (window.scrollY > 0 && navRef.current) {
      navRef.current.classList.add(styles.scrolled);
    } else if (navRef.current) {
      navRef.current.classList.remove(styles.scrolled);
    }
  });

  return (
    <div
      className={`${styles.profileContainer} ${
        alwaysScrolled ? styles.scrolled : ""
      }`}
      ref={navRef}
    >
      <Menu
        shadow="md"
        width={200}
        closeOnClickOutside
        closeOnItemClick
        position="bottom-end"
      >
        <Menu.Target>
          <div
            className={styles.Profile}
            onDoubleClick={() => {
              navigate(`/profile/${user?.username}`);
            }}
          >
            {user?.profile_picture_path ? (
              <img
                className={styles.profilePicture}
                src={`/data/user-data/profiles/profile_pictures/${user.profile_picture_path}`}
                alt="User Profile Picture"
              />
            ) : (
              <User />
            )}
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Signed in as {user?.username}</Menu.Label>
          <Menu.Divider />
          <Menu.Label>Your Stuff</Menu.Label>

          <Menu.Item
            icon={<User />}
            onClick={() => {
              navigate(`/profile/${user?.username}`);
            }}
          >
            Profile
          </Menu.Item>
          <Menu.Item
            icon={<Robot />}
            onClick={() => {
              navigate(`/profile/${user?.username}?tab=bots`);
            }}
          >
            Bots
          </Menu.Item>
          <Menu.Item
            icon={<BellSimple />}
            onClick={() => {
              navigate(`/profile/${user?.username}?tab=notifications`);
            }}
          >
            Notifications
          </Menu.Item>
          <Menu.Item
            icon={<Buildings />}
            onClick={() => {
              navigate(`/profile/${user?.username}`);
            }}
          >
            Organizations
          </Menu.Item>
          <Menu.Item
            icon={<Clipboard />}
            onClick={() => {
              navigate("/templates");
            }}
          >
            Templates <Disclaimer type="beta" size="sm" />
          </Menu.Item>
          {isSuperAdmin && (
            <Menu.Item
              icon={<Shield />}
              onClick={() => {
                navigate("/admin");
              }}
            >
              Admin
            </Menu.Item>
          )}

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
          <Menu.Item
            icon={<MegaphoneSimple />}
            onClick={() => {
              navigate("/feedback");
            }}
          >
            Leave Feedback
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
