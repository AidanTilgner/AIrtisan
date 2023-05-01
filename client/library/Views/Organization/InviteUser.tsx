import React from "react";
import styles from "./InviteUser.module.scss";
import {
  useCreateOrganizationInvitation,
  useGetOrganization,
  useGetOrganizationAdmins,
} from "../../hooks/fetching/organization";
import { useParams } from "react-router-dom";
import Search from "../../components/Search/Search";
import { useSearch } from "../../contexts/Search";
import { useSearchAdmins } from "../../hooks/fetching/admin";
import AdminCard from "../../components/Cards/Admin/AdminCard";
import { useModal } from "../../contexts/Modals";
import { Admin } from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import { Button } from "@mantine/core";

function InviteUser() {
  const { organization_id } = useParams();

  const { data: organization } = useGetOrganization(organization_id as string, {
    runOnDependencies: [organization_id],
  });

  const { query, setQuery } = useSearch();

  const { data: results } = useSearchAdmins(query, {
    runOnDependencies: [query],
  });

  const { data: admins } = useGetOrganizationAdmins(organization_id as string, {
    runOnDependencies: [organization_id],
  });

  console.log("results", results);

  const filteredResults = results?.filter((r) => {
    return !admins?.find((a) => a.id === r.id);
  });

  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null);

  const { createOrganizationInvitation } = useCreateOrganizationInvitation(
    {
      organization_id: organization_id as string,
      admin_id: selectedAdmin?.id as number,
    },
    {
      dependencies: [selectedAdmin],
    }
  );

  console.log("Selected", selectedAdmin);

  const { setModal, closeModal } = useModal();

  const handleInviteAdmin = async () => {
    const res = await createOrganizationInvitation();
    if (!res || !res.data || !res.success) {
      showNotification({
        title: "Error",
        message: "There was an error inviting the user",
        color: "red",
      });
      return;
    }
    showNotification({
      title: "Success",
      message: `Successfully invited ${
        selectedAdmin?.display_name || selectedAdmin?.username
      } to ${organization?.name}`,
    });
    setQuery("");
    closeModal();
  };

  return (
    <div className={styles.InviteUser}>
      <div className={styles.header}>
        <h1>Invite User to {organization?.name}</h1>
      </div>
      <div className={styles.userSearch}>
        <Search
          placeholder="Search for a user to invite..."
          typingDelay={500}
        />
      </div>
      {query && (
        <div className={styles.results}>
          {filteredResults && filteredResults.length > 0 ? (
            filteredResults?.map((result) => (
              <div className={styles.result} key={result.id}>
                <AdminCard
                  admin={result}
                  onClick={() => setSelectedAdmin(result)}
                />
                {selectedAdmin?.id === result.id && (
                  <div className={styles.options}>
                    <Button onClick={handleInviteAdmin}>Invite</Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No results found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default InviteUser;
