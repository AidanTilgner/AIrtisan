import React, { useState } from "react";
import { Context } from "../../../../documentation/main";
import useFetch from "../../../hooks/useFetch";
import { useBot } from "../../../contexts/Bot";
import styles from "./Context.module.scss";
import { Button, Tooltip } from "@mantine/core";
import ContextForm from "../../../components/Forms/Context/ContextForm";
import { TrashSimple } from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";

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
            afterSubmit={() => {
              reloadData();
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
              <ContextPair
                key={c[0]}
                label={c[0]}
                value={c[1]}
                reloadData={reloadData}
              />
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
  reloadData,
}: {
  label: string;
  value: unknown;
  reloadData: () => Promise<void>;
}) => {
  const [selected, setSelected] = useState(false);

  const { load: deleteContextItem } = useFetch<{ key: string }, Context>({
    url: "/training/context",
    method: "DELETE",
  });

  const deleteContext = async (key: string) => {
    const res = await deleteContextItem({
      updatedBody: {
        key,
      },
    });

    if (!res || !res.data) {
      showNotification({
        title: "Error",
        message: "Something went wrong deleting the context.",
      });
    }

    await reloadData();
    showNotification({
      title: "Success",
      message: "Context deleted successfully.",
    });
  };

  return (
    <Tooltip label={"Click to select."} multiline position="top-start">
      <div
        className={`${styles.contextPair} ${selected ? styles.selected : ""}`}
        onClick={() => {
          setSelected(!selected);
        }}
        onBlur={() => {
          setSelected(false);
        }}
        title="Click to expand"
      >
        <p className={styles.label} title={label}>
          <span>{label}</span>
          {selected && (
            <div className={styles.buttons}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContext(label);
                }}
              >
                <TrashSimple />
              </button>
            </div>
          )}
        </p>
        <p className={`${styles.value}`}>{String(value)}</p>
      </div>
    </Tooltip>
  );
};
