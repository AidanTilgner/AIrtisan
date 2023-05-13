import React, { useState } from "react";
import { Context, Model } from "../../../../documentation/main";
import useFetch from "../../../hooks/useFetch";
import { useBot } from "../../../contexts/Bot";
import styles from "./Context.module.scss";
import { Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import ContextForm from "../../../components/Forms/Context/ContextForm";

function Context() {
  const [contextFile, setcontextFile] = useState<Context>();

  const onSuccess = (data: Context) => {
    setcontextFile(data);
  };

  const { load } = useFetch<undefined, Context>({
    url: "/training/context",
    onSuccess,
    runOnMount: true,
  });

  const reloadData = async () => {
    load();
  };

  const [newContext, setNewContext] = useState<{ label: string; data: string }>(
    {
      label: "",
      data: "",
    }
  );

  const { load: addNewContext } = useFetch<Context, Context>({
    url: "/training/context",
    method: "PUT",
    body: {
      ...contextFile,
      [newContext.label]: newContext?.data,
    },
  });

  const handleAddNewContext = async () => {
    try {
      const res = await addNewContext();
      if (!res || !res.data) {
        showNotification({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
        return;
      }

      setNewContext({
        label: "",
        data: "",
      });
      reloadData();
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  const { bot } = useBot();

  const formattedContext = contextFile ? Object.entries(contextFile) : [];

  const [addingNewContext, setAddingNewContext] = useState(false);

  return (
    <div className={styles.Context}>
      <div className={styles.header}>
        <h1>{bot?.name} Context</h1>
        <div className={styles.buttons}>
          <Button
            onClick={() => {
              setAddingNewContext(!addingNewContext);
            }}
            variant={addingNewContext ? "outline" : "filled"}
          >
            {addingNewContext ? "Cancel" : "Add New Context"}
          </Button>
        </div>
      </div>
      {addingNewContext && (
        <div className={styles.contextFormContainer}>
          <ContextForm
            onUpdate={(data) => {
              setNewContext({
                label: data.label,
                data: data.data,
              });
            }}
            onClose={() => {
              setAddingNewContext(false);
            }}
          />
        </div>
      )}
      <div className={styles.content}>
        {formattedContext?.length ? (
          formattedContext.map((c) => {
            return (
              <div key={c[0]} className={styles.contextPairContainer}>
                <ContextPair label={c[0]} value={c[1]} />
              </div>
            );
          })
        ) : (
          <p>No context found.</p>
        )}
      </div>
    </div>
  );
}

export default Context;

export const ContextPair = ({
  label,
  value,
}: {
  label: string;
  value: unknown;
}) => {
  return (
    <div className={styles.contextPair}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{String(value)}</p>
    </div>
  );
};
