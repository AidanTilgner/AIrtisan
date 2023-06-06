import React from "react";
import styles from "./General.module.scss";
import { Button, Divider, Grid, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useBot } from "../../../contexts/Bot";

function General() {
  const { bot } = useBot();

  return (
    <div className={styles.General}>
      <Title order={1}>General</Title>
      <br />
      <Divider />
      <br />
      <Grid>
        <Grid.Col span={12}>
          <Title order={2}>Actions</Title>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          <Text size="sm">Create a template from this bot for later user</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Link to={`/templates/create?from_bot=${bot?.id}`}>
            <Button>Create Template</Button>
          </Link>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default General;
