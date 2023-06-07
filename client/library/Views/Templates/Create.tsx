import React, { useEffect, useState } from "react";
import styles from "./Create.module.scss";
import { Button, Flex, Grid, Select, TextInput, Title } from "@mantine/core";
import { useUser } from "../../contexts/User";
import { useGetMyOrganizations } from "../../hooks/fetching/admin";
import { showNotification } from "@mantine/notifications";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Template } from "../../../documentation/main";
import { useCreateTemplate } from "../../hooks/fetching/operations";
import { useGetAllBotsAdminHasAccessTo } from "../../hooks/fetching/bot";

function Create() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();

  const { data: allAdminBots } = useGetAllBotsAdminHasAccessTo({
    runOnMount: true,
  });

  const [formData, setFormData] = useState<
    Partial<Omit<Template, "visibility"> & { bot_id: number }>
  >({
    bot_id: Number(searchParams.get("from_bot")) || undefined,
    name: "",
    description: "",
    owner_id: user?.id as number,
    owner_type: "admin",
  });

  const [ownerType, setOwnerType] = useState<Template["owner_type"]>("admin");

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
    return (
      formData.name !== "" &&
      formData.description !== "" &&
      formData.owner_id !== undefined &&
      formData.owner_type !== undefined &&
      formData.bot_id !== undefined
    );
  };

  const { createTemplate } = useCreateTemplate({
    bot_id: formData.bot_id as number,
    name: formData.name as string,
    description: formData.description as string,
    owner_id: formData.owner_id as number,
    owner_type: formData.owner_type as Template["owner_type"],
  });

  const navigate = useNavigate();

  const handleSubmitNewTemplate = async () => {
    try {
      const res = await createTemplate();
      if (!res || !res.data) {
        showNotification({
          title: "Error",
          message:
            "There was an error creating your template. Please try again later.",
          color: "red",
        });
        return;
      }
      const template = res.data;
      showNotification({
        title: "Success",
        message: "Your template has been created!",
      });
      // navigate(`/templates/${template.id}`);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message:
          "There was an error creating your template. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <div className={styles.create}>
      <Title order={1}>Create a New Template</Title>
      <div className={styles.form}>
        <div className="form">
          <p className="resources">
            Templates allow you to create a base for your bot. You can create
            templates from existing bots currently, and then have reusable data
            for future bots.
          </p>
          <Grid>
            <Grid.Col span={12}>
              <h2>New Template</h2>
            </Grid.Col>
            <Grid.Col span={12}>
              <h3>Who does this template belong to?</h3>
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
                  setOwnerType(e as Template["owner_type"]);
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
              <h3>From what bot?</h3>
            </Grid.Col>
            <Grid.Col sm={12}>
              <Select
                label="Bot"
                description="The data from this bot will be turned into a template."
                data={
                  allAdminBots?.length
                    ? allAdminBots.map((bot) => {
                        return {
                          label: bot.name as string,
                          value: String(bot.id),
                        };
                      })
                    : [
                        {
                          label: "No bots found",
                          value: "none",
                        },
                      ]
                }
                value={String(formData.bot_id) || "none"}
                onChange={(e) =>
                  setFormData({ ...formData, bot_id: Number(e) })
                }
                searchable
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <h3>Template Details</h3>
            </Grid.Col>
            <Grid.Col sm={12}>
              <TextInput
                label="Template Name"
                placeholder="The name of your template..."
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.currentTarget.value })
                }
              />
            </Grid.Col>
            <Grid.Col sm={12}>
              <TextInput
                label="Template Description"
                description="What is this template for and how should it be used?"
                placeholder="The description of your template..."
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.currentTarget.value,
                  })
                }
              />
            </Grid.Col>
            <Grid.Col span={12} />
            <Grid.Col span={12}>
              <Flex align="center" justify="end">
                <Button onClick={handleSubmitNewTemplate} disabled={!isValid()}>
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
