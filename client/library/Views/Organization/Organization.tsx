import React, { useEffect, useMemo, useState } from "react";
import styles from "./Organization.module.scss";
import { Buildings } from "@phosphor-icons/react";
import {
  useGetOrganization,
  useGetOrganizationAdmins,
  useGetOrganizationBots,
} from "../../hooks/fetching/organization";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import Tabs from "../../components/Navigation/Tabs/Tabs";
import Search from "../../components/Search/Search";
import BotCard from "../../components/Cards/Bot/BotCard";
import { useSearchParamsUpdate } from "../../hooks/navigation";
import AdminCard from "../../components/Cards/Admin/AdminCard";
import { Organization } from "../../../documentation/main";
import Loaders from "../../components/Utils/Loaders";

type Tab = "admins" | "bots";

function Organization() {
  const { organization_id } = useParams();
  const [loading, setLoading] = useState(true);
  // const { user } = useUser();
  const { data: organization } = useGetOrganization(organization_id as string, {
    runOnMount: true,
    onFinally: () => {
      setLoading(false);
    },
  });

  const [searchParams] = useSearchParams();

  const [currentTab, setCurrentTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "bots"
  );

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

  if (loading) {
    return (
      <div
        style={{
          height: "50vh",
        }}
      >
        <Loaders.CenteredSpinner />
      </div>
    );
  }

  if (organization_id && !organization && !loading) {
    return <Navigate to={`/404?reason="Organization not found"`} />;
  }

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
          {/* <button title="Edit username">
            <PencilSimple weight="regular" />
          </button> */}
        </div>
        <div className={styles.tabsContainer}>
          <Tabs
            tabs={[
              {
                name: "Bots",
                id: "bots",
                visible: true,
              },
              {
                name: "Users",
                id: "admins",
                visible: true,
              },
            ]}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
        <div className={styles.content}>
          <DisplayCurrentTab
            currentTab={currentTab}
            organization={organization as Organization}
          />
        </div>
      </div>
    </div>
  );
}

export default Organization;

function DisplayCurrentTab({
  currentTab,
  organization,
}: {
  currentTab: Tab;
  organization: Organization;
}) {
  switch (currentTab) {
    case "bots":
      return <BotsTab />;
    case "admins":
      return <UsersTab organization={organization} />;
    default:
      return <p>Something went wrong</p>;
  }
}

function BotsTab() {
  const { organization_id } = useParams();
  const { data: bots } = useGetOrganizationBots(organization_id as string, {
    runOnMount: true,
  });

  const navigate = useNavigate();

  return useMemo(
    () => (
      <div className={styles.tab}>
        <div className={styles.searchContainer}>
          <Search />
        </div>
        <div className={styles.list}>
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
            <p className={styles.disclaimer}>No bots yet.</p>
          )}
        </div>
      </div>
    ),
    [bots]
  );
}

function UsersTab({ organization }: { organization: Organization }) {
  const { organization_id } = useParams();
  const { data: users } = useGetOrganizationAdmins(organization_id as string, {
    runOnMount: true,
  });

  const navigate = useNavigate();

  return useMemo(
    () => (
      <div className={styles.tab}>
        <div className={styles.searchContainer}>
          <Search />
        </div>
        <div className={styles.list}>
          {users && users?.length > 0 ? (
            users.map((b) => (
              <AdminCard
                key={b.id}
                admin={b}
                onClick={() => {
                  navigate(`/profile/${b.username}`);
                }}
                tag={organization.owner.id === b.id ? "Owner" : undefined}
              />
            ))
          ) : (
            <p className={styles.disclaimer}></p>
          )}
        </div>
      </div>
    ),
    [users]
  );
}
