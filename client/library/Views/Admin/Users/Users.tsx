import React from "react";
import styles from "./Users.module.scss";
import { useGetAllAdmins } from "../../../hooks/fetching/admin";
import AdminCard from "../../../components/Cards/Admin/AdminCard";
import { useSearch } from "../../../contexts/Search";
import { Chip, Grid, Title } from "@mantine/core";
import Search from "../../../components/Search/Search";
import { useNavigate } from "react-router-dom";

function Users() {
  const { data: allUsers } = useGetAllAdmins({
    runOnMount: true,
  });

  const { query } = useSearch();

  const [showSuperAdmins, setShowSuperAdmins] = React.useState(false);

  const filteredAdmins = allUsers?.filter((admin) => {
    const passesQuery = () => {
      if (!query) return true;
      const passes = [
        admin.display_name,
        admin.email,
        admin.id,
        admin.role,
        admin.username,
      ].some((field) => {
        return (
          field && String(field)?.toLowerCase().includes(query.toLowerCase())
        );
      });
      return passes;
    };

    const passesShowSuperAdmins =
      admin.role === "superadmin" ? showSuperAdmins : true;
    return passesQuery() && passesShowSuperAdmins;
  });

  const navigate = useNavigate();

  return (
    <div className={styles.Users}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={2}>Users</Title>
        </Grid.Col>
        <Grid.Col span={12}>
          <Search />
        </Grid.Col>
        <Grid.Col span={12}>
          <div className={styles.filters}>
            <div className={styles.filter}>
              <Chip
                onClick={() => {
                  setShowSuperAdmins(!showSuperAdmins);
                }}
                checked={showSuperAdmins}
              >
                Show SuperAdmins
              </Chip>
            </div>
          </div>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          {filteredAdmins && filteredAdmins?.length > 0 ? (
            <div className={styles.Users__container}>
              {filteredAdmins.map((admin) => {
                return (
                  <AdminCard
                    admin={admin}
                    key={admin.id}
                    onClick={() => navigate(`/profile/${admin.username}`)}
                  />
                );
              })}
            </div>
          ) : (
            <p>There are no users to display.</p>
          )}
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Users;
