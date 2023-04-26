import React, { useEffect, useState } from "react";
import styles from "./Organization.module.scss";
import { Buildings, PencilSimple } from "@phosphor-icons/react";
import { useGetMyBots } from "../../hooks/fetching/common";
import {
  useGetOrganization,
  useGetOrganizationBots,
} from "../../hooks/fetching/organization";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Tabs from "../../components/Navigation/Tabs/Tabs";
import Search from "../../components/Search/Search";
import BotCard from "../../components/Cards/Bot/BotCard";
import { useSearchParamsUpdate } from "../../hooks/navigation";

type Tab = "users" | "bots";

function Organization() {
  const { organization_id } = useParams();
  // const { user } = useUser();
  const { data: organization } = useGetOrganization(organization_id as string, {
    runOnMount: true,
  });

  console.log("Organization", organization);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [currentTab, setCurrentTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "bots"
  );

  console.log(searchParams.get("tab"), currentTab);

  useEffect(() => {
    if (searchParams.get("tab") && searchParams.get("tab") !== currentTab) {
      setCurrentTab(searchParams.get("tab") as Tab);
    }
  }, [searchParams]);

  const searchParamsUpdate = useSearchParamsUpdate();

  useEffect(() => {
    if (currentTab && searchParams.get("tab") !== currentTab) {
      searchParamsUpdate(new Map([["tab", currentTab]]));
    }
  }, [currentTab]);

  return (
    <div className={styles.Organization}>
      <div className={styles.left}>
        <div className={styles.iconContainer}>
          <div className={styles.icon}>
            <Buildings weight="thin" />
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.name}>
          <span>{organization?.name}</span>
          <button title="Edit username">
            <PencilSimple weight="regular" />
          </button>
        </div>
        <div className={styles.tabsContainer}>
          <Tabs
            tabs={[
              {
                name: "Bots",
                id: "bots",
              },
              {
                name: "Users",
                id: "users",
              },
            ]}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
        <div className={styles.content}>
          <DisplayCurrentTab currentTab={currentTab} />
        </div>
      </div>
    </div>
  );
}

export default Organization;

function DisplayCurrentTab({ currentTab }: { currentTab: Tab }) {
  switch (currentTab) {
    case "bots":
      return <BotsTab />;
    case "users":
      return <UsersTab />;
    default:
      return <p>Something went wrong</p>;
  }
}

function BotsTab() {
  const { organization_id } = useParams();
  const { data: bots } = useGetOrganizationBots(organization_id as string, {
    runOnMount: true,
  });

  console.log("Bots", bots);

  const navigate = useNavigate();

  return (
    <div className={styles.botsTab}>
      <div className={styles.searchContainer}>
        <Search />
      </div>
      <div className={styles.bots}>
        {bots && bots?.length > 0 ? (
          bots.map((b) => (
            <BotCard
              key={b.id}
              bot={b}
              onClick={() => {
                navigate(`/bots/${b.id}`);
              }}
            />
          ))
        ) : (
          <p className={styles.disclaimer}></p>
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className={styles.usersTab}>
      <p className={styles.disclaimer}>No users yet.</p>
    </div>
  );
}
