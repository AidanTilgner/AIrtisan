import React from "react";
import { useGetAllAdminTemplates } from "../../hooks/fetching/operations";
import Loaders from "../../components/Utils/Loaders";
import styles from "./index.module.scss";
import TemplateCard from "../../components/Cards/Template/TemplateCard";
import { Button, Chip, Flex, Grid, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import Search from "../../components/Search/Search";
import { useSearch } from "../../contexts/Search";
import Disclaimer from "../../components/Utils/Disclaimer/Disclaimer";

// should probably abstract this list view structure
function index() {
  const { data: allTemplates, loading } = useGetAllAdminTemplates({
    runOnMount: true,
  });

  const navigate = useNavigate();

  const { query } = useSearch();

  const [onlyAdminTemplates, setOnlyAdminTemplates] = React.useState(false);

  const filteredTemplates = allTemplates?.filter((temp) => {
    const passesQuery = () => {
      if (!query) return true;

      const passes = [
        temp.name,
        temp.id,
        temp.description,
        temp.owner_type,
        temp.created_at,
      ].some((field) => {
        return (
          field && String(field)?.toLowerCase().includes(query.toLowerCase())
        );
      });
      return passes;
    };

    const passedOnlyAdminTemplates = onlyAdminTemplates
      ? temp.owner_type === "admin"
      : true;
    return passesQuery() && passedOnlyAdminTemplates;
  });

  if (loading) {
    return (
      <div>
        <Loaders.CenteredSpinner />
      </div>
    );
  }

  return (
    <div className={styles.templates}>
      <div className={styles.templateList}></div>
      <Grid>
        <Grid.Col span={12}>
          <Flex align="center" justify="space-between">
            <Title order={2}>
              Templates <Disclaimer type="beta" size="md" />
            </Title>
            <Button
              onClick={() => {
                navigate("/templates/create");
              }}
            >
              New
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          <Search />
        </Grid.Col>
        <Grid.Col span={12}>
          <div className={styles.filters}>
            <div className={styles.filter}>
              <Chip
                onClick={() => {
                  setOnlyAdminTemplates(!onlyAdminTemplates);
                }}
                checked={onlyAdminTemplates}
              >
                Only My Templates
              </Chip>
            </div>
          </div>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          {filteredTemplates && filteredTemplates?.length > 0 ? (
            <div className={styles.templateList}>
              {filteredTemplates.map((temp) => {
                return (
                  <TemplateCard
                    template={temp}
                    key={temp.id}
                    onClick={() => navigate(`/templates/${temp.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <p>There are no templates to display.</p>
          )}
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default index;
