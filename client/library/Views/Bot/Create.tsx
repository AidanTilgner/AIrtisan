import React, { useEffect, useState } from "react";
import styles from "./Create.module.scss";
import { Button, Flex, Grid, Select, TextInput } from "@mantine/core";
import { Bot } from "../../../documentation/main";
import { useUser } from "../../contexts/User";
import { useGetMyOrganizations } from "../../hooks/fetching/admin";
import { useCreateBot } from "../../hooks/fetching/bot";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

function Create() {
  const { user } = useUser();

  const [formData, setFormData] = useState<Partial<Bot>>({
    name: "",
    description: "",
    bot_version: "0.1.0 Beta",
    owner_id: user?.id as number,
    owner_type: "admin",
    bot_language: "en-US",
  });

  const [ownerType, setOwnerType] = useState<Bot["owner_type"]>("admin");

  const { data: organizations } = useGetMyOrganizations({
    runOnMount: true,
  });

  useEffect(() => {
    if (ownerType === "admin") {
      setFormData({ ...formData, owner_id: user?.id as number });
    } else {
      setFormData({ ...formData, owner_id: undefined });
    }
  }, [ownerType, user]);

  const isValid = () => {
    return (
      formData.name !== "" &&
      formData.description !== "" &&
      formData.bot_version !== "" &&
      formData.bot_language !== "" &&
      formData.owner_id !== undefined
    );
  };

  const { createBot } = useCreateBot(
    {
      name: formData.name as string,
      description: formData.description as string,
      bot_version: formData.bot_version as string,
      bot_language: formData.bot_language as string,
      owner_id: formData.owner_id as number,
      owner_type: formData.owner_type as Bot["owner_type"],
    },
    {
      dependencies: [formData],
    }
  );

  const navigate = useNavigate();

  const handleSubmitNewBot = async () => {
    try {
      const res = await createBot();
      if (!res || !res.data) {
        showNotification({
          title: "Error",
          message:
            "There was an error creating your bot. Please try again later.",
          color: "red",
        });
        return;
      }
      const bot = res.data;
      showNotification({
        title: "Success",
        message: "Your bot has been created!",
      });
      navigate(`/bots/${bot.id}`);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message:
          "There was an error creating your bot. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <div className={styles.create}>
      <div className={styles.header}>
        <h1>Create a bot</h1>
      </div>
      <div className={styles.form}>
        <Grid>
          <Grid.Col sm={12} md={6}>
            <Select
              label="Owner Type"
              data={[
                { value: "admin", label: "Admin" },
                { value: "organization", label: "Organization" },
              ]}
              value={ownerType}
              onChange={(e) => setOwnerType(e as Bot["owner_type"])}
            />
          </Grid.Col>
          {ownerType === "admin" ? (
            <Grid.Col sm={12} md={6} />
          ) : (
            <Grid.Col sm={12} md={6}>
              <Select
                label="Organization"
                data={
                  organizations
                    ? organizations.map((org) => {
                        return {
                          label: org.name as string,
                          value: String(org.id),
                        };
                      })
                    : []
                }
                value={String(formData.owner_id)}
                onChange={(e) =>
                  setFormData({ ...formData, owner_id: Number(e) })
                }
                searchable
              />
            </Grid.Col>
          )}

          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Name"
              placeholder="The name of your bot..."
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.currentTarget.value })
              }
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Description"
              placeholder="A short description of your bot..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.currentTarget.value })
              }
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Bot Version"
              placeholder="The version of your bot..."
              value={formData.bot_version || ""}
              onChange={(e) =>
                setFormData({ ...formData, bot_version: e.currentTarget.value })
              }
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Bot Language"
              placeholder="The language of your bot..."
              value={formData.bot_language || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bot_language: e.currentTarget.value,
                })
              }
            />
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <Flex align="center" justify="end">
              <Button onClick={handleSubmitNewBot} disabled={!isValid()}>
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
