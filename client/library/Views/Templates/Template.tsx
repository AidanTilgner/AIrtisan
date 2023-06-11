import React, { useEffect, useMemo } from "react";
import styles from "./Template.module.scss";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetTemplate } from "../../hooks/fetching/operations";
import { Grid, Group, SegmentedControl, Text, Title } from "@mantine/core";
import Loaders from "../../components/Utils/Loaders";
import { useSearchParamsUpdate } from "../../hooks/navigation";
import ModelData from "./pages/ModelData/ModelData";
import Context from "./pages/Context/Context";
import Corpus from "./pages/Corpus/Corpus";
import { getFormattedDate } from "../../helpers/formating";

type Tabs = "settings" | "corpus" | "context";

function Template() {
  const { template_id } = useParams();

  const { data: template, loading } = useGetTemplate(Number(template_id), {
    dependencies: [template_id],
    runOnMount: true,
  });

  const [searchParams] = useSearchParams();

  const [currentTab, setCurrentTab] = React.useState<Tabs>(
    (searchParams.get("tab") as Tabs) || "settings"
  );

  const updateSearchParams = useSearchParamsUpdate();

  const updateTab = (tab: Tabs) => {
    updateSearchParams(new Map([["tab", tab]]));
  };

  useEffect(() => {
    setCurrentTab((searchParams.get("tab") as Tabs) || "settings");
  }, [searchParams]);

  return useMemo(
    () => (
      <div className={styles.Template}>
        {loading && <Loaders.CenteredSpinner />}
        <Grid>
          <Grid.Col span={12}>
            <Title order={4} weight={500} color="var(--text-color-light)">
              Template
            </Title>
            <div className={styles.title}>
              <Title order={1}>{template?.name}</Title>
              <Text size="lg">
                {getFormattedDate(template?.updated_at || "")}
              </Text>
            </div>
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <Group position="center">
              <SegmentedControl
                data={[
                  { label: "Settings", value: "settings" },
                  { label: "Corpus", value: "corpus" },
                  { label: "Context", value: "context" },
                ]}
                value={currentTab}
                onChange={(value) => {
                  updateTab(value as Tabs);
                }}
              />
            </Group>
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <div className={styles.currentTab}>
              <DisplayCurrentTab currentTab={currentTab} />
            </div>
          </Grid.Col>
        </Grid>
      </div>
    ),
    [currentTab, template, searchParams]
  );
}

export default Template;

function DisplayCurrentTab({ currentTab }: { currentTab: Tabs }) {
  switch (currentTab) {
    case "settings":
      return <ModelData />;
    case "context":
      return <Context />;
    case "corpus":
      return <Corpus />;
  }
}
