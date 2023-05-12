import React, { useEffect, useMemo, useState } from "react";
import styles from "./Profile.module.scss";
import { Check, PencilSimple, Plus, User, X } from "@phosphor-icons/react";
import { useUser } from "../../contexts/User";
import OrganizationCard from "../../components/Cards/Organization/OrganizationCard";
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
import {
  useGetAdminByUsername,
  useGetAdminBots,
  useGetAdminOrganizations,
  useUpdateMe,
  useGetMyBots,
  useGetMyNotifications,
} from "../../hooks/fetching/admin";
import Loaders from "../../components/Utils/Loaders";
import { Button, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Bot } from "../../../documentation/main";
import NotificationCard from "../../components/Cards/Notification/Notification";
import { useSearch } from "../../contexts/Search";

type Tab = "notifications" | "bots";

function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useUser();

  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: user, getAdmin: reloadAdmin } = useGetAdminByUsername(
    username as string,
    {
      runOnMount: true,
      onFinally: () => {
        setLoading(false);
      },
    }
  );

  useEffect(() => {
    setIsCurrentUser(currentUser?.username === username);
  }, [currentUser, username]);

  const { data: organizations = [] } = useGetAdminOrganizations(
    user?.id as unknown as string,
    {
      runOnDependencies: [user?.id],
    }
  );

  const navigate = useNavigate();

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

  const [isEditing, setIsEditingState] = useState(false);

  const setIsEditing = (value: boolean) => {
    if (!isCurrentUser) return;
    setIsEditingState(value);
  };

  const [newProfile, setNewProfile] = useState({
    username: user?.username,
    display_name: user?.display_name,
    email: user?.email,
  });

  useEffect(() => {
    setNewProfile({
      username: user?.username,
      display_name: user?.display_name,
      email: user?.email,
    });
  }, [user]);

  const { updateMe } = useUpdateMe(newProfile, {
    onSuccess: () => {
      setIsEditing(false);
    },
    dependencies: [newProfile],
  });

  const handleUpdateProfile = async () => {
    if (!(user?.username === username)) {
      return;
    }

    const res = await updateMe();

    if (!res || res.error) {
      showNotification({
        title: "Error",
        message:
          res?.message || "Something went wrong while updating your profile",
        color: "red",
      });
      return;
    }

    showNotification({
      title: "Success",
      message: "Your profile has been updated",
    });
    reloadAdmin();
  };
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

  if (username && !user && !loading) {
    return <Navigate to={`/404?reason="User not found"`} />;
  }

  return (
    <div className={styles.Profile}>
      <div className={styles.left}>
        <div className={styles.iconContainer}>
          <div className={styles.icon}>
            <User weight="thin" />
          </div>
        </div>
        {isEditing ? (
          <div className={styles.profileEdit}>
            <div className={styles.form}>
              <TextInput
                label="Username"
                type="text"
                value={newProfile.username || ""}
                onChange={(e) => {
                  setNewProfile({
                    ...newProfile,
                    username: e.currentTarget.value,
                  });
                }}
                placeholder="Your official, unique username"
              />
              <TextInput
                label="Display name"
                type="text"
                value={newProfile.display_name || ""}
                onChange={(e) => {
                  setNewProfile({
                    ...newProfile,
                    display_name: e.currentTarget.value,
                  });
                }}
                placeholder="How people see your name"
              />
              <TextInput
                label="Email"
                type="email"
                value={newProfile.email || ""}
                onChange={(e) => {
                  setNewProfile({
                    ...newProfile,
                    email: e.currentTarget.value,
                  });
                }}
                placeholder="Your email address"
              />
            </div>
            <div className={styles.editOptions}>
              <button
                title="Cancel changes"
                className={`${styles.cancel} ${styles.editOption}`}
                onClick={() => {
                  setIsEditing(false);
                }}
              >
                <X weight="regular" />
              </button>
              <button
                title="Save changes"
                className={`${styles.save} ${styles.editOption}`}
                onClick={() => {
                  handleUpdateProfile();
                }}
              >
                <Check weight="regular" />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.name}>
            <span>{user?.display_name || user?.username}</span>
            {isCurrentUser && (
              <button
                title="Edit profile"
                onClick={() => {
                  setIsEditing(true);
                }}
              >
                <PencilSimple weight="regular" />
              </button>
            )}
          </div>
        )}
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
            {isCurrentUser && (
              <div className={styles.addOrgContainer}>
                <button
                  title="Create new organization"
                  className={styles.newOrganization}
                  onClick={() => {
                    navigate("/organizations/create");
                  }}
                >
                  <Plus weight="regular" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.tabsContainer}>
          <Tabs
            tabs={[
              {
                name: "Bots",
                id: "bots",
                visible: true,
              },
              {
                name: "Notifications",
                id: "notifications",
                visible: isCurrentUser,
              },
            ]}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
        <div className={styles.content}>
          <DisplayCurrentTab
            currentTab={currentTab}
            isCurrentUser={isCurrentUser}
            user_id={user?.id || undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;

function DisplayCurrentTab({
  currentTab,
  isCurrentUser,
  user_id,
}: {
  currentTab: Tab;
  isCurrentUser: boolean;
  user_id: number | undefined;
}) {
  switch (currentTab) {
    case "bots":
      return <BotsTab isCurrentUser={isCurrentUser} user_id={user_id} />;
    case "notifications":
      return <NotificationsTab />;
    default:
      return <p>Something went wrong</p>;
  }
}

function BotsTab({
  isCurrentUser,
  user_id,
}: {
  isCurrentUser: boolean;
  user_id: number | undefined;
}) {
  const [bots, setBots] = useState<Bot[]>([]);

  const { getMyBots } = useGetMyBots({
    dependencies: [isCurrentUser],
  });

  const { getAdminBots } = useGetAdminBots(user_id as number, {
    dependencies: [isCurrentUser, user_id],
  });

  useEffect(() => {
    if (isCurrentUser) {
      getMyBots().then((res) => {
        if (!res || !res.data) {
          showNotification({
            title: "Error",
            message: "Could not fetch bots",
            color: "red",
          });
          return;
        }
        setBots(res.data);
      });
    } else {
      getAdminBots().then((res) => {
        if (!res || !res.data) return;
        setBots(res.data);
      });
    }
  }, [isCurrentUser, getMyBots, getAdminBots]);

  const navigate = useNavigate();

  const { query } = useSearch();

  const filteredBots = bots.filter((b) => {
    const passesQuery =
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.description.toLowerCase().includes(query.toLowerCase());

    return passesQuery;
  });

  return useMemo(
    () => (
      <div className={styles.botsTab}>
        <div className={styles.searchContainer}>
          <Search />
          <Button
            onClick={() => {
              navigate("/bots/create");
            }}
            title="Create new bot"
          >
            New
          </Button>
        </div>
        <div className={styles.bots}>
          {filteredBots && filteredBots?.length > 0 ? (
            filteredBots.map((b) => (
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
    [bots, navigate, query]
  );
}

function NotificationsTab() {
  const { data: notifications } = useGetMyNotifications({
    runOnMount: true,
  });

  return (
    <div className={styles.notificationsTab}>
      {notifications?.length && notifications.length > 0 ? (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.body}
              notification={notification}
            />
          ))}
        </div>
      ) : (
        <p className={styles.disclaimer}>No notifications yet.</p>
      )}
    </div>
  );
}
