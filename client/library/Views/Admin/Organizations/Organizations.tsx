import React from "react";
import styles from "./Organizations.module.scss";
import { useSearch } from "../../../contexts/Search";
import { Grid, Title } from "@mantine/core";
import Search from "../../../components/Search/Search";
import { useNavigate } from "react-router-dom";
import { useGetAllOrganizations } from "../../../hooks/fetching/organization";
import InformativeOrganization from "../../../components/Cards/Organization/InformativeOrganization";

function Organizations() {
  const { data: allOrganizations } = useGetAllOrganizations({
    runOnMount: true,
  });

  const { query } = useSearch();

  const filteredOrganizations = allOrganizations?.filter((organization) => {
    const passesQuery = () => {
      if (!query) return true;
      const passes = [
        organization.name,
        organization.owner.username,
        organization.owner.display_name,
      ].some((field) => {
        return (
          field && String(field)?.toLowerCase().includes(query.toLowerCase())
        );
      });
      return passes;
    };

    return passesQuery();
  });

  const navigate = useNavigate();

  return (
    <div className={styles.Organizations}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={2}>Organizations</Title>
        </Grid.Col>
        <Grid.Col span={12}>
          <Search />
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          {filteredOrganizations && filteredOrganizations?.length > 0 ? (
            <div className={styles.Organizations__container}>
              {filteredOrganizations.map((organization) => {
                return (
                  <InformativeOrganization
                    organization={organization}
                    key={organization.id}
                    onClick={() =>
                      navigate(`/organizations/${organization.id}`)
                    }
                  />
                );
              })}
            </div>
          ) : (
            <p>There are no organizations to display.</p>
          )}
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Organizations;
