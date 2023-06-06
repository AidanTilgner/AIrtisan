import React, { useState } from "react";
import { Context } from "../../../../documentation/main";
import useFetch from "../../../hooks/useFetch";
import { useBot } from "../../../contexts/Bot";
import styles from "./Context.module.scss";
import { Button, Tooltip } from "@mantine/core";
import ContextForm from "../../../components/Forms/Context/ContextForm";
import AutogenerateContext from "../../../components/Forms/Context/Autogenerate";
import { PencilSimple, TrashSimple } from "@phosphor-icons/react";
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
  const [autogenerateForm, setAutogenerateForm] = useState(false);

  const [editingContext, setEditingContext] = useState<string>();

  return (
    <div className={styles.Context}>
      <div className={styles.header}>
        <h1>{bot?.name} Context</h1>
        <div className={styles.buttons}>
          <Button
            onClick={() => {
              setAddingNewContext(!addingNewContext);
              setAutogenerateForm(false);
            }}
            variant={addingNewContext ? "outline" : "filled"}
          >
            {addingNewContext ? "Cancel" : "Add New Context"}
          </Button>
          <Button
            onClick={() => {
              setAutogenerateForm(!autogenerateForm);
              setAddingNewContext(false);
            }}
            variant={autogenerateForm ? "outline" : "filled"}
          >
            {autogenerateForm ? (
              "Cancel"
            ) : (
              <span>
                Autogenerate <span className="beta">Beta</span>
              </span>
            )}
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
          />
        </div>
      )}
      {autogenerateForm && (
        <div className={styles.contextFormContainer}>
          <AutogenerateContext
            afterSubmit={() => {
              reloadData();
            }}
            onClose={() => {
              setAutogenerateForm(false);
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
  const [selected, setSelected] = useState(false);

  const { load: deleteContextItem } = useFetch<{ key: string }, Context>({
    url: "/training/context",
    method: "DELETE",
    body: {
      key: label,
    },
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
