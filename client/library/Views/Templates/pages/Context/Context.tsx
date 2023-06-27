import React, { useState } from "react";
import { Context } from "../../../../../documentation/main";
import useFetch from "../../../../hooks/useFetch";
import { useBot } from "../../../../contexts/Bot";
import styles from "./Context.module.scss";
import { Button, Tooltip } from "@mantine/core";
import ContextForm from "../../../../components/Forms/Context/ContextForm";
import { PencilSimple, TrashSimple } from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";
import { useParams } from "react-router-dom";

function Context() {
  const { template_id } = useParams();

  const [contextFile, setcontextFile] = useState<Context>();

  const onSuccess = (data: Context) => {
    setcontextFile(data);
  };

  const { load } = useFetch<undefined, Context>({
    url: `/operations/templates/${template_id}/context`,
    onSuccess,
    runOnMount: true,
    useBotId: false,
  });

  const reloadData = async () => {
    load();
  };

  const { bot } = useBot();

  const formattedContext = contextFile ? Object.entries(contextFile) : [];

  const [addingNewContext, setAddingNewContext] = useState(false);

  const [editingContext, setEditingContext] = useState<string>();

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
              setEditingContext(undefined);
            }}
            loadContextItem={editingContext}
            currentContext={contextFile}
            submitUrl={`/operations/templates/${template_id}/context`}
            omitBotId
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
                setEditingContext={(key: string) => {
                  setEditingContext(key);
                  setAddingNewContext(true);
                }}
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
  setEditingContext,
}: {
  label: string;
  value: unknown;
  reloadData: () => Promise<void>;
  setEditingContext: (key: string) => void;
}) => {
  const { template_id } = useParams();
  const [selected, setSelected] = useState(false);

  const { load: deleteContextItem } = useFetch<{ key: string }, Context>({
    url: `/operations/templates/${template_id}/context`,
    method: "DELETE",
    body: {
      key: label,
    },
    dependencies: [label, template_id],
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
        color: "red",
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
            <span className={styles.contextButtons}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteContext(label);
                }}
              >
                <TrashSimple />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingContext(label);
                }}
              >
                <PencilSimple />
              </button>
            </span>
          )}
        </p>
        <p className={`${styles.value}`}>{String(value)}</p>
      </div>
    </Tooltip>
  );
};
