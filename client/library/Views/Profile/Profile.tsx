import React, { useState } from "react";
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

type Tab = "notifications" | "bots";

function Profile() {
  const { user } = useUser();
  const { data: organizations = [] } = useGetMyOrganizations({
    runOnMount: true,
  });

  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<Tab>("bots");

  const [searchParams] = useSearchParams();

  console.log("Updated");

  React.useEffect(() => {
    const tab = searchParams.get("tab") as Tab | null;
    if (tab && tab !== currentTab) {
      setCurrentTab(tab);
    }
  }, [searchParams]);

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
  console.log("Bots", bots);

  return (
    <div className={styles.botsTab}>
      <div className={styles.searchContainer}>
        <Search />
      </div>
      <div className={styles.bots}>
        {bots && bots?.length > 0 ? (
          bots.map((b) => <BotCard key={b.id} bot={b} />)
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
      <h3>Notifications</h3>
    </div>
  );
}
