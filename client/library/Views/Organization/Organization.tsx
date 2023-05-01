import React, { useEffect, useMemo, useState } from "react";
import styles from "./Organization.module.scss";
import { Buildings, Check, PencilSimple, X } from "@phosphor-icons/react";
import {
  useCheckIsOwnerOfOrganization,
  useDeleteOrganization,
  useGetOrganization,
  useGetOrganizationAdmins,
  useGetOrganizationBots,
  useUpdateOrganization,
} from "../../hooks/fetching/organization";
import {
  Link,
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
import { Organization as OrganizationType } from "../../../documentation/main";
import Loaders from "../../components/Utils/Loaders";
import { useUser } from "../../contexts/User";
import { Button, Flex, TextInput, Textarea } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useModal } from "../../contexts/Modals";

type Tab = "admins" | "bots" | "settings";

function Organization() {
  const { user } = useUser();
  const { organization_id } = useParams();
  const [loading, setLoading] = useState(true);
  // const { user } = useUser();
  const { data: organization, getOrganization: reloadOrganization } =
    useGetOrganization(organization_id as string, {
      runOnMount: true,
      onFinally: () => {
        setLoading(false);
      },
    });

  const { data: isOwner } = useCheckIsOwnerOfOrganization(
    {
      organization_id: organization_id as string,
      admin_id: user?.id as number,
    },
    {
      runOnDependencies: [organization_id, user?.id],
    }
  );

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

  const [editing, setEditing] = useState(false);

  const [newOrganization, setNewOrganization] = useState({
    name: organization?.name as string,
    description: organization?.description as string,
  });

  useEffect(() => {
    setNewOrganization({
      name: organization?.name as string,
      description: organization?.description as string,
    });
  }, [organization]);

  const { updateOrganization } = useUpdateOrganization(
    organization_id as string,
    {
      name: newOrganization.name,
      description: newOrganization.description,
    },
    {
      dependencies: [organization_id, newOrganization],
    }
  );

  const handleUpdateOrganization = async () => {
    const res = await updateOrganization();
    if (!res || !res.data || !res.success) {
      showNotification({
        title: "Error",
        message: "Something went wrong while updating your organization",
        color: "red",
      });
      return;
    }
    setEditing(false);
    showNotification({
      title: "Success",
      message: "Organization updated successfully",
    });
    reloadOrganization();
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
        {editing ? (
          <div className={styles.organizationEdit}>
            <div className={styles.form}>
              <TextInput
                label="Name"
                type="text"
                value={newOrganization.name || ""}
                onChange={(e) => {
                  setNewOrganization({
                    ...newOrganization,
                    name: e.currentTarget.value,
                  });
                }}
                placeholder="Your official organization name"
              />
              <Textarea
                label="Description"
                value={newOrganization.description || ""}
                onChange={(e) => {
                  setNewOrganization({
                    ...newOrganization,
                    description: e.currentTarget.value,
                  });
                }}
                placeholder="Your official organization description"
              />
            </div>
            <div className={styles.editOptions}>
              <button
                title="Cancel changes"
                className={`${styles.cancel} ${styles.editOption}`}
                onClick={() => {
                  setEditing(false);
                }}
              >
                <X weight="regular" />
              </button>
              <button
                title="Save changes"
                className={`${styles.save} ${styles.editOption}`}
                onClick={() => {
                  handleUpdateOrganization();
                }}
              >
                <Check weight="regular" />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.name}>
            <span>{organization?.name}</span>
            {isOwner && (
              <button
                title="Edit organization"
                onClick={() => {
                  setEditing(!editing);
                }}
              >
                <PencilSimple weight="regular" />
              </button>
            )}
          </div>
        )}
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
              {
                name: "Settings",
                id: "settings",
                visible: !!isOwner,
              },
            ]}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
        <div className={styles.content}>
          <DisplayCurrentTab
            currentTab={currentTab}
            organization={organization as OrganizationType}
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
  organization: OrganizationType;
}) {
  switch (currentTab) {
    case "bots":
      return <BotsTab />;
    case "admins":
      return <UsersTab organization={organization} />;
    case "settings":
      return <SettingsTab organization={organization} />;
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

function UsersTab({ organization }: { organization: OrganizationType }) {
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
        <div className={styles.add}>
          <Link to="invite">Invite User</Link>
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

function SettingsTab({ organization }: { organization: OrganizationType }) {
  const { setModal, closeModal } = useModal();

  const { deleteOrganization } = useDeleteOrganization(
    organization.id as number,
    {
      onSuccess: () => {
        closeModal();
      },
      dependencies: [organization.id],
    }
  );

  const navigate = useNavigate();

  const { user } = useUser();

  const handleDeleteOrganization = () => {
    setModal({
      title: "Delete Organization",
      content: () => {
        const [nameConfirmation, setNameConfirmation] = useState("");

        return (
          <div>
            <p>
              Type {'"'}
              <strong>{organization.name}</strong>
              {'"'} to confirm deletion of the organization.
            </p>
            <TextInput
              label="Organization Name"
              value={nameConfirmation}
              onChange={(e) => {
                setNameConfirmation(e.currentTarget.value);
              }}
            />
            <br />
            <Flex align="center" justify="flex-end" gap="24px">
              <Button variant="default" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="filled"
                color="red"
                onClick={async () => {
                  const res = await deleteOrganization();
                  if (!res || !res.data || !res.success) {
                    showNotification({
                      title: "Error",
                      message: "Something went wrong",
                      color: "red",
                    });
                    return;
                  }
                  showNotification({
                    title: "Success",
                    message: `Organization ${organization.name} deleted successfully`,
                  });
                  closeModal();
                  navigate(`/profile/${user?.username}`);
                }}
                disabled={nameConfirmation !== organization.name}
              >
                Delete
              </Button>
            </Flex>
          </div>
        );
      },
      type: "confirmation",
      buttons: [],
      onClose: closeModal,
      size: "md",
    });
  };

  return (
    <div className={styles.tab}>
      <section className={styles.danger_zone}>
        <h3>Danger Zone</h3>
        <div className={styles.danger_zone_content}>
          <div className={styles.danger_zone_content_disclaimer}>
            <p>
              Deleting your organization will delete all of the bots belonging
              to it.
            </p>
            <p>
              Are you sure you want to delete {'"'}
              {organization.name}
              {'"'}?
            </p>
          </div>
          <div className={styles.danger_zone_content_action}>
            <Button
              color="red"
              className={styles.delete_button}
              onClick={handleDeleteOrganization}
            >
              Delete Organization
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
