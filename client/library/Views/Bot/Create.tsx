import React, { useEffect, useState } from "react";
import styles from "./Create.module.scss";
import { Button, Flex, Grid, Select, TextInput, Title } from "@mantine/core";
import { Bot } from "../../../documentation/main";
import { useUser } from "../../contexts/User";
import { useGetMyOrganizations } from "../../hooks/fetching/admin";
import { useCreateBot } from "../../hooks/fetching/bot";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import { useGetAllAdminTemplates } from "../../hooks/fetching/operations";

function Create() {
  const { user } = useUser();

  const { data: templates } = useGetAllAdminTemplates({
    runOnMount: true,
  });

  const [formData, setFormData] = useState<
    Partial<Bot> & { template_id?: number }
  >({
    name: "",
    description: "",
    bot_version: "0.1.0 Beta",
    owner_id: user?.id as number,
    owner_type: "admin",
    bot_language: "en-US",
    template_id: undefined,
  });

  const [ownerType, setOwnerType] = useState<Bot["owner_type"]>("admin");

  const { data: organizations } = useGetMyOrganizations({
    runOnMount: true,
  });

  useEffect(() => {
    if (ownerType === "admin") {
      setFormData({
        ...formData,
        owner_id: user?.id as number,
        owner_type: ownerType,
      });
    } else {
      setFormData({ ...formData, owner_id: undefined, owner_type: ownerType });
    }
  }, [ownerType, user]);

  const isValid = () => {
    if (formData.template_id) {
      return (
        formData.name !== "" &&
        formData.owner_id !== undefined &&
        formData.owner_type !== undefined
      );
    }

    return (
      formData.name !== "" &&
      formData.description !== "" &&
      formData.bot_language !== "" &&
      formData.owner_id !== undefined &&
      formData.owner_type !== undefined
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
      template_id: formData.template_id as number | undefined,
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
      <Title order={1}>Create a New Bot</Title>
      <div className={styles.form}>
        <div className="form">
          <Grid>
            <Grid.Col span={12}>
              <h2>New Bot</h2>
            </Grid.Col>
            <Grid.Col span={12}>
              <h3>Who does this bot belong to?</h3>
            </Grid.Col>
            <Grid.Col sm={12}>
              <Select
                label="Owner"
                data={[
                  { value: "admin", label: "Me" },
                  {
                    value: "organization",
                    label: `An Organization ${
                      !organizations || organizations.length < 1
                        ? "(None found)"
                        : ""
                    }`,
                    disabled: !organizations || organizations.length < 1,
                  },
                ]}
                value={ownerType}
                onChange={(e) => {
                  setOwnerType(e as Bot["owner_type"]);
                }}
              />
            </Grid.Col>
            {ownerType === "admin" ? (
              <Grid.Col sm={12} />
            ) : (
              <Grid.Col sm={12}>
                <Select
                  label="Organization"
                  data={
                    organizations?.length
                      ? organizations.map((org) => {
                          return {
                            label: org.name as string,
                            value: String(org.id),
                          };
                        })
                      : [
                          {
                            label: "No organizations found",
                            value: "none",
                          },
                        ]
                  }
                  value={String(formData.owner_id) || "none"}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_id: Number(e) })
                  }
                  searchable
                />
              </Grid.Col>
            )}
            <Grid.Col span={12}>
              <h3>Are you using a template?</h3>
            </Grid.Col>
            <Grid.Col sm={12}>
              <Select
                label="Template"
                description="Would you like to use a template to create your bot?"
                placeholder="Select a template..."
                data={
                  templates?.length
                    ? [
                        ...templates.map((template) => {
                          return {
                            label: template.name as string,
                            value: String(template.id),
                          };
                        }),
                        {
                          label: "None",
                          value: "",
                        },
                      ]
                    : [
                        {
                          label: "No templates found",
                          value: "",
                        },
                      ]
                }
                value={String(formData.template_id) || ""}
                onChange={(e) =>
                  setFormData({ ...formData, template_id: Number(e) })
                }
                searchable
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <h3>Bot Details</h3>
            </Grid.Col>
            <Grid.Col sm={12}>
              <TextInput
                label="Bot Name"
                placeholder="The name of your bot..."
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.currentTarget.value })
                }
              />
            </Grid.Col>
            <Grid.Col sm={12}>
              <TextInput
                label="Bot Identity"
                description="How would you describe to your bot it's purpose and identity?"
                placeholder="Describe your bot's purpose and identity..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.currentTarget.value,
                  })
                }
                disabled={formData.template_id !== undefined}
              />
            </Grid.Col>
            <Grid.Col sm={12}>
              <Select
                label="Bot Language"
                description="This helps us pick the model to use for your bot"
                placeholder="The language of your bot..."
                value={formData.bot_language || ""}
                onChange={(e) => {
                  if (e === null) return;
                  setFormData({
                    ...formData,
                    bot_language: e as Bot["bot_language"],
                  });
                }}
                data={[
                  {
                    value: "en-US",
                    label: "English (United States) <en-US>",
                  },
                  { value: "fr-FR", label: "French (France) <fr-FR>" },
                ]}
                disabled={formData.template_id !== undefined}
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
    </div>
  );
}

export default Create;
