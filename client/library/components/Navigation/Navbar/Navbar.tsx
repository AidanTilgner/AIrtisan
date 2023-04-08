import React from "react";
import withStyles from "react-css-modules";
import styles from "./Navbar.module.scss";
import { Button, Burger } from "@mantine/core";
import { retrainModel } from "../../../helpers/fetching";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/User";

function Navbar() {
  const isMobile = window.innerWidth < 768;
  const [opened, setOpened] = React.useState(false);
  const location = useLocation();

  const { isSuperAdmin } = useUser();

  const currentPath = location.pathname;

  const routes = (
    <>
      <li
        className={
          currentPath === "/interactive" ? styles.active : styles.inactive
        }
      >
        <Link to="/interactive">Interactive</Link>
      </li>
      <li
        className={currentPath === "/preview" ? styles.active : styles.inactive}
      >
        <Link to="/preview">Preview</Link>
      </li>
      <li
        className={
          currentPath === "/review/conversations"
            ? styles.active
            : styles.inactive
        }
      >
        <Link to="/review/conversations">Review Conversations</Link>
      </li>
    </>
  );

  const superAdminRoutes = isSuperAdmin ? (
    <>
      <li
        className={
          currentPath === "/admin/auth" ? styles.active : styles.inactive
        }
      >
        <Link to="/admin/auth">Auth</Link>
      </li>
    </>
  ) : null;

  return (
    <div className={styles.navbar}>
      <h2 className={styles.title}>Onyx Chat</h2>
      {isMobile && (
        <Burger
          opened={opened}
          onClick={() => {
            setOpened(!opened);
          }}
        />
      )}
      {opened && (
        <ul
          className={styles.mobile_items}
          onClick={() => {
            setOpened(false);
          }}
        >
          {routes}
          {superAdminRoutes}
          <li>
            <Button
              onClick={() => {
                retrainModel();
              }}
              variant="outline"
            >
              Refresh Model
            </Button>
          </li>
        </ul>
      )}
      {!isMobile && (
        <ul className={styles.items}>
          {routes}
          {superAdminRoutes}
          <li>
            <Button
              onClick={() => {
                retrainModel();
              }}
              variant="outline"
            >
              Refresh Model
            </Button>
          </li>
        </ul>
      )}
    </div>
  );
}

export default withStyles(styles)(Navbar);
