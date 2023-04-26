import React, { useEffect, useState } from "react";
import styles from "./Profile.module.scss";
import { PencilSimple, Plus, User } from "@phosphor-icons/react";
import { useUser } from "../../contexts/User";
import {
  useGetMyBots,
  useGetMyOrganizations,
} from "../../hooks/fetching/common";
import OrganizationCard from "../../components/Cards/Organization/OrganizationCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import Tabs from "../../components/Navigation/Tabs/Tabs";
import Search from "../../components/Search/Search";
import BotCard from "../../components/Cards/Bot/BotCard";
import { useSearchParamsUpdate } from "../../hooks/navigation";

type Tab = "notifications" | "bots";

function Profile() {
  const { user } = useUser();
  const { data: organizations = [] } = useGetMyOrganizations({
    runOnMount: true,
  });

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
    <div className={styles.Profile}>
      <div className={styles.left}>
        <div className={styles.iconContainer}>
          <div className={styles.icon}>
            <User weight="thin" />
          </div>
        </div>
        <div className={styles.organizationsContainer}>
          <h3>Organizations</h3>
          <div className={styles.organizations}>
            {organizations?.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                onClick={() => {
                  navigate("/organizations/" + organization.id);
                }}
              />
            ))}
            <button
              title="Create or join organization"
              className={styles.newOrganization}
            >
              <Plus weight="thin" />
            </button>
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.name}>
          <span>{user?.username}</span>
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
                name: "Notifications",
                id: "notifications",
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

export default Profile;

function DisplayCurrentTab({ currentTab }: { currentTab: Tab }) {
  switch (currentTab) {
    case "bots":
      return <BotsTab />;
    case "notifications":
      return <NotificationsTab />;
    default:
      return <p>Something went wrong</p>;
  }
}

function BotsTab() {
  const { data: bots } = useGetMyBots({ runOnMount: true });

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

function NotificationsTab() {
  return (
    <div className={styles.notificationsTab}>
      <p className={styles.disclaimer}>No notifications yet.</p>
    </div>
  );
}
