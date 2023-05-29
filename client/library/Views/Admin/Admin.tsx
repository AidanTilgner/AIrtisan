import React from "react";
import styles from "./Admin.module.scss";
import { useUser } from "../../contexts/User";
import Loaders from "../../components/Utils/Loaders";
import { Button, Flex, Grid, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";

function Admin() {
  const { loading } = useUser();

  const navigate = useNavigate();

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

  return (
    <div className={styles.Admin}>
      <Grid>
        <Grid.Col span={12}>
          <Flex align="center" justify="space-between">
            <Title order={2}>Feedback</Title>
            <Button
              onClick={() => {
                navigate("/admin/feedback");
              }}
            >
              All
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12} />

        <Grid.Col span={12}>
          <Flex align="center" justify="space-between">
            <Title order={2}>Users</Title>
            <Button
              onClick={() => {
                navigate("/admin/users");
              }}
            >
              All
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12} />

        <Grid.Col span={12}>
          <Flex align="center" justify="space-between">
            <Title order={2}>Bots</Title>
            <Button
              onClick={() => {
                navigate("/admin/bots");
              }}
            >
              All
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12} />

        <Grid.Col span={12}>
          <Flex align="center" justify="space-between">
            <Title order={2}>Organizations</Title>
            <Button
              onClick={() => {
                navigate("/admin/organizations");
              }}
            >
              All
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12} />
      </Grid>
    </div>
  );
}

export default Admin;
