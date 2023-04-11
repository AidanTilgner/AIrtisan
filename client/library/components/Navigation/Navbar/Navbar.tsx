import React from "react";
import styles from "./Navbar.module.scss";
import { Button, Burger, Menu } from "@mantine/core";
import { retrainModel } from "../../../helpers/fetching";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/User";
import { SignOut } from "phosphor-react";
import { logout } from "../../../helpers/auth";
import SVG from "../../Utils/SVG";

function Navbar() {
  const isMobile = window.innerWidth < 768;
  const [opened, setOpened] = React.useState(false);
  const location = useLocation();

  const { isSuperAdmin } = useUser();

  const currentPath = location.pathname;

  const routes = (
    <>
      <li>
        <Link
          to="/"
          className={currentPath === "/" ? styles.active : styles.inactive}
        >
          Welcome
        </Link>
      </li>
      <li>
        <Link
          to="/train"
          className={currentPath === "/train" ? styles.active : styles.inactive}
        >
          Training
        </Link>
      </li>
      <li>
        <Link
          to="/preview"
          className={
            currentPath === "/preview" ? styles.active : styles.inactive
          }
        >
          Previews
        </Link>
      </li>
      <li>
        <Link
          to="/review/conversations"
          className={
            currentPath === "/review/conversations"
              ? styles.active
              : styles.inactive
          }
        >
          Conversations
        </Link>
      </li>
    </>
  );

  const superAdminRoutes = isSuperAdmin ? (
    <>
      <li>
        <Link
          to="/admin/auth"
          className={
            currentPath === "/admin/auth" ? styles.active : styles.inactive
          }
        >
          Auth
        </Link>
      </li>
    </>
  ) : null;

  const settingsOptions = (
    <div className={styles.settingsOptions}>
      <div className={styles.option}>
        <Button
          onClick={() => {
            retrainModel();
          }}
          variant="outline"
          style={{
            width: "100%",
          }}
        >
          Refresh Model
        </Button>
      </div>
      <div className={styles.option}>
        <Menu shadow="md" width={200} position="top">
          <Menu.Target>
            <Button
              style={{
                width: "100%",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Other
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Options</Menu.Label>
            {/* <Menu.Item icon={<Gear size={14} />}>Settings</Menu.Item> */}
            <Menu.Item icon={<SignOut size={14} />} onClick={logout}>
              Sign Out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );

  return (
    <div className={styles.navbar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <SVG.OnyxLogo width="100%" height="100%" />
        </div>
        <h2 className={styles.title}>Onyx Chat</h2>
      </div>
      {isMobile && (
        <Burger
          opened={opened}
          onClick={() => {
            setOpened(!opened);
          }}
        />
      )}
      {opened && (
        <>
          <ul
            className={styles.mobile_items}
            onClick={() => {
              setOpened(false);
            }}
          >
            {routes}
            {superAdminRoutes}
            {settingsOptions}
          </ul>
        </>
      )}
      {!isMobile && (
        <>
          <ul className={styles.items}>
            {routes}
            {superAdminRoutes}
          </ul>
          {settingsOptions}
        </>
      )}
    </div>
  );
}

export default Navbar;
