import React from "react";
import styles from "./Context.module.scss";
import { Context } from "../../../../documentation/main";
import { Autocomplete, Button, Grid, Group, TextInput } from "@mantine/core";
import useFetch from "../../../hooks/useFetch";
import { showNotification } from "@mantine/notifications";

interface ContextFormProps {
  afterSubmit: (data: Context) => void;
  onClose?: () => void;
}

function ContextForm({ afterSubmit, onClose }: ContextFormProps) {
  const [formState, setFormState] = React.useState<{
    label: string;
    data: string;
  }>({
    label: "",
    data: "",
  });

  const { load: addContext } = useFetch<Context, Context>({
    url: "/training/context",
    method: "PUT",
    body: {
      context: { [formState.label]: formState.data },
    },
    dependencies: [formState],
  });

  const { data: contextFile, load: reload } = useFetch<undefined, Context>({
    url: "/training/context",
    runOnMount: true,
  });

  const formattedContext = contextFile ? Object.keys(contextFile) : [];

  const handleSubmit = async () => {
    const res = await addContext();
    if (!res || !res.data) {
      showNotification({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
      return;
    }

    if (afterSubmit) {
      afterSubmit(formState);
      onClose && onClose();
    }

    reload();
  };

  return (
    <div className={styles.ContextForm}>
      <p className={styles.resources}>
        If you have questions, consider reading up on{" "}
        <a href="https://docs.airtisan.app" target="_blank" rel="noreferrer">
          the documentation
        </a>
        .
      </p>
      <Grid>
        <Grid.Col span={12}>
          <h2>Add or Update Context Object</h2>
        </Grid.Col>
        <Grid.Col span={12}>
          <Autocomplete
            label="Label"
            placeholder="Label"
            value={formState.label}
            description="The name of the context"
            onChange={(v) => {
              setFormState({
                ...formState,
                label: v.toLowerCase(),
              });
            }}
            data={formattedContext}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Data"
            placeholder="Data"
            value={formState.data}
            description="The data of the context"
            onChange={(e) => {
              setFormState({
                ...formState,
                data: e.currentTarget.value,
              });
            }}
          />
        </Grid.Col>
        <Grid.Col sm={12}>
          <Group position="right">
            <Button
              variant="outline"
              onClick={() => {
                setFormState({
                  label: "",
                  data: "",
                });
                if (onClose) {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={() => {
                handleSubmit();
              }}
            >
              Save
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default ContextForm;
