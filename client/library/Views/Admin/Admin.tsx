import React from "react";
import styles from "./Admin.module.scss";
import { useUser } from "../../contexts/User";
import Loaders from "../../components/Utils/Loaders";
import { Button, Card, Flex, Grid, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useGetAllFeedback } from "../../hooks/fetching/operations";
import { useGetAllAdmins } from "../../hooks/fetching/admin";
import { useGetAllBots } from "../../hooks/fetching/bot";
import { useGetAllOrganizations } from "../../hooks/fetching/organization";

function Admin() {
  const { loading } = useUser();

  const navigate = useNavigate();

  const { data: allFeedbackRaw } = useGetAllFeedback({
    runOnMount: true,
  });

  const allFeedback = allFeedbackRaw?.filter((feedback) => !feedback.reviewer);

  const { data: allUsers } = useGetAllAdmins({
    runOnMount: true,
  });

  const { data: allBots } = useGetAllBots({
    runOnMount: true,
  });

  const { data: allOrgs } = useGetAllOrganizations({
    runOnMount: true,
  });

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
        <Grid.Col span={12}>
          <Card>
            <p>
              There {allFeedback && allFeedback.length !== 1 ? "are" : "is"}{" "}
              <strong>{allFeedback?.length || 0}</strong> new feedback{" "}
              {allFeedback && allFeedback.length === 0 ? "messages" : "message"}
              .
            </p>
          </Card>
        </Grid.Col>
        <Grid.Col span={12} />
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
        <Grid.Col span={12}>
          <Card>
            <p>
              There {allUsers && allUsers.length !== 1 ? "are" : "is"}{" "}
              <strong>{allUsers?.length || 0}</strong> users.
            </p>
          </Card>
        </Grid.Col>
        <Grid.Col span={12} />
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
        <Grid.Col span={12}>
          <Card>
            <p>
              There {allBots && allBots.length !== 1 ? "are" : "is"} currently{" "}
              <strong>{allBots?.length || 0}</strong> bots.
            </p>
          </Card>
        </Grid.Col>
        <Grid.Col span={12} />
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
        <Grid.Col span={12}>
          <Card>
            <p>
              There {allOrgs && allOrgs.length !== 1 ? "are" : "is"} currently{" "}
              <strong>{allOrgs?.length || 0}</strong>{" "}
              {allOrgs?.length !== 1 ? "organizations" : "organization"}.
            </p>
          </Card>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
      </Grid>
    </div>
  );
}

export default Admin;
