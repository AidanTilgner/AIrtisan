import React, { useEffect, useState } from "react";
import { Model } from "../../../../../documentation/main";
import useFetch from "../../../../hooks/useFetch";
import styles from "./ModelData.module.scss";
import { useBot } from "../../../../contexts/Bot";
import {
  Anchor,
  Button,
  Checkbox,
  Flex,
  Grid,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useGetTemplateModelFile } from "../../../../hooks/fetching/operations";
import { useParams } from "react-router-dom";

function ModelData() {
  const { template_id } = useParams();

  const [modelFile, setModelFile] = useState<Model>();

  const onSuccess = (data: Model) => {
    setModelFile(data);
  };

  const { getTemplateModelFile } = useGetTemplateModelFile(
    Number(template_id),
    {
      dependencies: [template_id],
      onSuccess: (data) => {
        setModelFile(data);
      },
      runOnMount: true,
    }
  );

  const reloadData = async () => {
    getTemplateModelFile();
  };

  const { bot } = useBot();

  const [formData, setFormData] = useState<Model>({
    personality: {
      name: "",
      description: "",
      initial_prompt: "",
    },
    works_for: {
      name: "",
      description: "",
      site_url: "",
      tagline: "",
      metadata: {},
    },
    specification: {
      model: "gpt-3.5-turbo",
      version: "0.1.0",
      none_fallback: false,
      hipaa_compliant: false,
    },
    security: {
      domain_whitelist: [],
      allow_widgets: false,
    },
  });

  useEffect(() => {
    if (modelFile) {
      setFormData(modelFile);
    }
  }, [modelFile]);

  const { load: updateData } = useFetch<{ model: Model }, Model>({
    url: "/training/model",
    method: "PUT",
    onSuccess,
    body: {
      model: formData,
    },
    dependencies: [formData],
  });

  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (modelFile && formData !== modelFile && !changed) {
      setChanged(true);
    }
  }, [formData]);

  const handleSubmit = async () => {
    if (!changed) return;
    const res = await updateData();

    if (!res?.data) {
      showNotification({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    }

    showNotification({
      title: "Success",
      message: "Model updated",
    });

    await reloadData();

    setChanged(false);
  };

  return (
    <div className={styles.Model}>
      <div className={styles.header}>
        <h1>{bot?.name} Model Configuration</h1>
      </div>
      <div>
        <Grid>
          <Grid.Col span={12}>
            <Title order={2}>Personality</Title>
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Name"
              value={formData.personality.name}
              onChange={(event) => {
                setFormData({
                  ...formData,
                  personality: {
                    ...formData.personality,
                    name: event.currentTarget.value,
                  },
                });
              }}
              placeholder="Your bot's name"
              description="Your bot's name."
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <Textarea
              label="Bot Identity"
              value={formData.personality.description}
              description="How would you describe to your bot it's purpose and identity?"
              placeholder="Describe your bot's purpose and identity..."
              onChange={(event) => {
                setFormData({
                  ...formData,
                  personality: {
                    ...formData.personality,
                    description: event.currentTarget.value,
                  },
                });
              }}
            />
          </Grid.Col>
          {/* <Grid.Col sm={12} md={6}>
            <Textarea
              label="Initial Prompt"
              value={formData.personality.initial_prompt}
              onChange={(event) => {
                setFormData({
                  ...formData,
                  personality: {
                    ...formData.personality,
                    initial_prompt: event.currentTarget.value,
                  },
                });
              }}
              placeholder="The initial prompt for your bot"
              description="As if you're telling the bot who it is."
            />
          </Grid.Col> */}
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <Title order={2}>Works For</Title>
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Name"
              value={formData.works_for.name}
              onChange={(event) => {
                setFormData({
                  ...formData,
                  works_for: {
                    ...formData.works_for,
                    name: event.currentTarget.value,
                  },
                });
              }}
              placeholder={
                bot?.owner_type === "admin"
                  ? "Your name"
                  : "Your organization's name"
              }
              description={
                bot?.owner_type === "admin"
                  ? "Your name"
                  : "Your organization's name"
              }
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <Textarea
              label="Description"
              value={formData.works_for.description}
              onChange={(event) => {
                setFormData({
                  ...formData,
                  works_for: {
                    ...formData.works_for,
                    description: event.currentTarget.value,
                  },
                });
              }}
              placeholder={
                bot?.owner_type === "admin"
                  ? "A description of yourself"
                  : "A description of your organization"
              }
              description={
                bot?.owner_type === "admin"
                  ? "Your bot will be given this description before sending any message."
                  : "Your bot will be given this description before sending any message."
              }
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Site URL"
              value={formData.works_for.site_url}
              onChange={(event) => {
                setFormData({
                  ...formData,
                  works_for: {
                    ...formData.works_for,
                    site_url: event.currentTarget.value,
                  },
                });
              }}
              placeholder={
                bot?.owner_type === "admin"
                  ? "Your website"
                  : "Your organization's website"
              }
              description={
                bot?.owner_type === "admin"
                  ? "Your bot will attempt to direct users to this URL during conversations."
                  : "Your bot will attempt to direct users to this URL during conversations."
              }
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Tagline"
              value={formData.works_for.tagline}
              onChange={(event) => {
                setFormData({
                  ...formData,
                  works_for: {
                    ...formData.works_for,
                    tagline: event.currentTarget.value,
                  },
                });
              }}
              placeholder={
                bot?.owner_type === "admin"
                  ? "A fancy phrase that describes you"
                  : "Your organization's tagline"
              }
              description={
                bot?.owner_type === "admin"
                  ? "Your bot will be given this tagline before sending any message."
                  : "Your bot will be given this tagline before sending any message."
              }
            />
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <Title order={2}>Specification</Title>
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <Checkbox
              label="None Fallback"
              checked={formData.specification.none_fallback}
              description="If the intent isn't recognized, the bot will rely solely on enhancement."
              onChange={(event) => {
                setFormData({
                  ...formData,
                  specification: {
                    ...formData.specification,
                    none_fallback: event.currentTarget.checked,
                  },
                });
              }}
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <Checkbox
              label={
                <>
                  HIPAA Friendly *
                  <Anchor
                    href="/terms-and-conditions#hipaa-compliance"
                    target="_blank"
                  >
                    disclaimer
                  </Anchor>
                </>
              }
              checked={formData.specification.hipaa_compliant}
              description={
                <>
                  Sensitive user information will be scrubbed from conversation
                  history before reaching human eyes. Please note the{" "}
                  <Anchor
                    href="/terms-and-conditions#hipaa-compliance"
                    target="_blank"
                  >
                    disclaimer
                  </Anchor>
                  , as this feature may not be 100% accurate.
                </>
              }
              onChange={(event) => {
                setFormData({
                  ...formData,
                  specification: {
                    ...formData.specification,
                    hipaa_compliant: event.currentTarget.checked,
                  },
                });
              }}
            />
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            <Title order={2}>Security</Title>
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <TextInput
              label="Domains"
              value={formData.security.domain_whitelist.join(", ")}
              description="A comma-separated list of domains that are allowed to use your bot."
              placeholder="example.com, example.org"
              onChange={(event) => {
                setFormData({
                  ...formData,
                  security: {
                    ...formData.security,
                    domain_whitelist: event.currentTarget.value
                      .split(",")
                      .map((domain) => domain.trim()),
                  },
                });
              }}
            />
          </Grid.Col>
          <Grid.Col sm={12} md={6}>
            <Checkbox
              label="Allow Widgets"
              checked={formData.security.allow_widgets}
              description="Allow your bot to be accessed publically. This is required for widgets, otherwise your bot will only be accessible via the API."
              onChange={(event) => {
                setFormData({
                  ...formData,
                  security: {
                    ...formData.security,
                    allow_widgets: event.currentTarget.checked,
                  },
                });
              }}
            />
          </Grid.Col>
          <Grid.Col span={12} />
          <Grid.Col span={12} />
          <Grid.Col span={12}>
            {changed && (
              <Flex justify={"flex-end"} align={"center"} gap="18px">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSubmit} variant={"filled"}>
                  Save
                </Button>
              </Flex>
            )}
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}

export default ModelData;
