import React from "react";
import styles from "./Tabs.module.scss";

interface TabsProps<Tab extends string> {
  tabs: { name: string; id: Tab; visible: boolean }[];
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
}

function Tabs<Tab extends string>({
  tabs,
  currentTab,
  setCurrentTab,
}: TabsProps<Tab>) {
  return (
    <div className={styles.Tabs}>
      {tabs
        .filter((t) => t.visible)
        .map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setCurrentTab(tab.id);
            }}
            className={`${
              currentTab === tab.id
                ? `${styles.tab} ${styles.active}`
                : styles.tab
            }`}
          >
            {tab.name}
          </button>
        ))}
    </div>
  );
}

export default Tabs;
