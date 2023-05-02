import React, { useState } from "react";
import styles from "./Create.module.scss";
import { Button, Flex, Grid, TextInput } from "@mantine/core";
import { Organization } from "../../../documentation/main";
import { useUser } from "../../contexts/User";
import { useCreateOrganization } from "../../hooks/fetching/organization";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

function Create() {
  const { user } = useUser();

  const [formData, setFormData] = useState<Partial<Organization>>({
    name: "",
    description: "",
  });

  const { createOrganization } = useCreateOrganization(
    {
      owner_id: user?.id as number,
      name: formData.name as string,
      description: formData.description as string,
    },
    {
      dependencies: [formData.name, formData.description, user?.id],
    }
  );

  const navigate = useNavigate();

  const handleCreateOrganization = async () => {
    const res = await createOrganization();
    if (!res || !res.data) {
      showNotification({
        title: "Error",
        message: "An error occurred while creating your organization.",
        color: "red",
      });
      return;
    }
    showNotification({
      title: "Success",
      message: "Your organization has been created.",
    });
    navigate(`/organizations/${res.data.id}`);
  };

  const validated = formData.name && formData.description;

  return (
    <div className={styles.create}>
      <div className={styles.header}>
        <h1>Create Organization</h1>
      </div>
      <div className={styles.form}>
        <Grid>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Name"
              placeholder="Your organization's name..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.currentTarget.value })
              }
              withAsterisk
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              withAsterisk
              label="Description"
              placeholder="Your organization's description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.currentTarget.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <Flex align="center" justify="end">
              <Button onClick={handleCreateOrganization} disabled={!validated}>
                Create
              </Button>
            </Flex>
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}

export default Create;
