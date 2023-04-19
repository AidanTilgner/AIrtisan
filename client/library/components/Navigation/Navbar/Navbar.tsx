import React, { useEffect } from "react";
import styles from "./Navbar.module.scss";
import { Button, Burger, Menu } from "@mantine/core";
import { retrainModel } from "../../../helpers/fetching";
import { getAllAdminBots } from "../../../helpers/fetching/bots";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/User";
import { useBot } from "../../../contexts/Bot";
import {
  Chat,
  Chats,
  HandWaving,
  SignOut,
  MonitorPlay,
  TextColumns,
  Fingerprint,
} from "@phosphor-icons/react";
import { logout } from "../../../helpers/auth";
import SVG from "../../Utils/SVG";
import { Bot } from "../../../../documentation/main";
import { showNotification } from "@mantine/notifications";

function Navbar() {
  const isMobile = window.innerWidth < 768;
  const [opened, setOpened] = React.useState(false);
  const location = useLocation();
  const [bots, setBots] = React.useState<Bot[]>([]);
  const { bot, botSelected, setBot } = useBot();

  useEffect(() => {
    getAllAdminBots().then(({ success, data }) => {
      if (!success || !data) {
        setBots(data);
        showNotification({
          title: "Error",
          message: "Could not fetch bots",
        });
        return;
      }
      setBots(data);
    });
  }, []);

  const { isSuperAdmin } = useUser();

  const currentPath = location.pathname;

  const routes = (
    <>
      <li>
        <Link
          to="/"
          className={currentPath === "/" ? styles.active : styles.inactive}
        >
          <HandWaving />
          Welcome
        </Link>
      </li>
      <li>
        <Link
          to="/train"
          className={currentPath === "/train" ? styles.active : styles.inactive}
        >
          <Chat />
          Training
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
          <Chats />
          Conversations
        </Link>
      </li>
      <li>
        <Link
          to="/preview"
          className={
            currentPath === "/preview" ? styles.active : styles.inactive
          }
        >
          <MonitorPlay />
          Previews
        </Link>
      </li>
      <li>
        <Link
          to="/corpus"
          className={
            currentPath === "/corpus" ? styles.active : styles.inactive
          }
        >
          <TextColumns />
          Corpus
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
          <Fingerprint />
          Auth
        </Link>
      </li>
    </>
  ) : null;

  const handleBotSelect = (bt: Bot) => {
    setBot(bt);
  };

  const settingsOptions = (
    <div className={styles.settingsOptions}>
      <div className={`${styles.option} ${styles.botChoice}`}>
        <Menu shadow="md" width={200} position="top">
          <Menu.Target>
            <Button
              style={{
                width: "100%",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              variant="outline"
            >
              {botSelected && bot ? `Using: ${bot.name}` : "Select Bot"}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Bots</Menu.Label>
            {bots.map((bot) => (
              <Menu.Item
                key={bot.id}
                onClick={() => {
                  handleBotSelect(bot);
                }}
              >
                {bot.name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
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
      <hr />
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
