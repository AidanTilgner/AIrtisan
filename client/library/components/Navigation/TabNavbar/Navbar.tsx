import React from "react";
import styles from "./Navbar.module.scss";
import { Burger } from "@mantine/core";
import { useBot } from "../../../contexts/Bot";
import { useRetrainBot } from "../../../hooks/fetching/common";
import { showNotification } from "@mantine/notifications";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { getFormattedBotOwner } from "../../../helpers/formating";
import { Link } from "react-router-dom";
import { useUser } from "../../../contexts/User";

interface NavbarProps<Tabs> {
  tabs: { icon: JSX.Element; name: string; id: Tabs; visible: boolean }[];
  currentTab: Tabs;
  setTab: (tab: Tabs) => void;
}

function Navbar<Tab>({ tabs, currentTab, setTab }: NavbarProps<Tab>) {
  const isMobile = window.innerWidth < 768;
  const [opened, setOpened] = React.useState(false);

  const { bot } = useBot();
  const { retrainBot } = useRetrainBot();

  const tabElements = React.useMemo(
    () =>
      tabs.map((tab, i) => (
        <li
          key={i}
          className={`${styles.item} ${
            currentTab === tab.id ? styles.active : ""
          }`}
          onClick={() => {
            setTab(tab.id);
          }}
        >
          <div className={styles.icon}>{tab.icon}</div>
          <span className={styles.name}>{tab.name}</span>
        </li>
      )),
    [tabs, currentTab, setTab]
  );

  const otherOptions = () => {
    return (
      <>
        <li className={styles.option}>
          <button
            onClick={() => {
              retrainBot()
                .then(() => {
                  showNotification({
                    title: "Retrained",
                    message: "Bot has been retrained",
                  });
                })
                .catch(() => {
                  showNotification({
                    title: "Error",
                    message: "Bot could not be retrained",
                  });
                });
            }}
          >
            <ArrowsClockwise />
            Retrain Model
          </button>
        </li>
      </>
    );
  };
  const { user } = useUser();

  const owner = getFormattedBotOwner(bot);

  const ownerLink =
    bot?.owner_type === "organization"
      ? `/organization/${bot.owner_id}`
      : `/profile/${user?.username}`;

  return (
    <div className={styles.navbar}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Link className={styles.namelink} to={ownerLink}>
            {owner}
          </Link>{" "}
          / <span className={styles.botname}>{bot?.name}</span>
        </h2>
      </div>
      <br />
      {isMobile && (
        <Burger
          opened={opened}
          onClick={() => {
            setOpened(!opened);
          }}
        />
      )}
      {opened && (
        <div
          className={styles.mobile}
          onClick={() => {
            setOpened(false);
          }}
        >
          <ul className={styles.mobile_items}>{tabElements}</ul>
          <ul className={styles.settingsOptions}>{otherOptions()}</ul>
        </div>
      )}
      {!isMobile && (
        <>
          <ul className={styles.items}>{tabElements}</ul>
          <ul className={styles.settingsOptions}>{otherOptions()}</ul>
        </>
      )}
    </div>
  );
}

export default Navbar;
