import React from "react";
import styles from "./Settings.module.scss";
import {
  Flex,
  Grid,
  Group,
  SegmentedControl,
  Text,
  Title,
} from "@mantine/core";
import { useSettings } from "../../contexts/Settings";
import { Themes } from "../../../documentation/theme";

function Settings() {
  const {
    theme: { set: setTheme, current: currentTheme },
  } = useSettings();

  return (
    <div className={styles.settings}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={1}>Settings</Title>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          <Title order={2}>Theme</Title>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          <Group position="left">
            <Flex align="flex-start" direction="column" gap="md">
              <Text>Choose how you want AIrtisan to look for you.</Text>
              <SegmentedControl
                data={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                value={currentTheme}
                onChange={(value) => {
                  if (!value) return;
                  setTheme(value as Themes);
                }}
              />
            </Flex>
          </Group>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Settings;
