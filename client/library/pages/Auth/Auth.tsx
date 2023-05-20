import React from "react";
import styles from "./Auth.module.scss";
import { TrashSimple, Copy } from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";
import {
  useAddApiKey,
  useDeleteApiKey,
  useGetApiKeys,
} from "../../hooks/fetching/bot";

function Auth() {
  const { data: apiKeys, getApiKeys: reloadApiKeys } = useGetApiKeys({
    runOnMount: true,
  });

  const [newApiKey, setNewApiKey] = React.useState({
    name: "",
  });

  const [addedApiKey, setAddedApiKey] = React.useState({
    name: "",
    key: "",
  });

  const { addApiKey } = useAddApiKey(newApiKey.name, {
    dependencies: [newApiKey.name],
  });

  const addNewApiKey = () => {
    if (!newApiKey.name) return;
    addApiKey().then((res) => {
      if (!res || !res.data) {
        showNotification({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
        return;
      }
      setNewApiKey({ name: "" });
      setAddedApiKey({
        name: res.data.for,
        key: res.data.key,
      });
      reloadApiKeys();
    });
  };

  const copyKey = () => {
    navigator.clipboard.writeText(addedApiKey.key);
    showNotification({
      title: "Copied!",
      message: "Key copied to clipboard",
    });
  };

  const { deleteApiKey } = useDeleteApiKey();

  const handleDeleteApiKey = (id: number) => {
    deleteApiKey({ updatedUrl: `/auth/api-key/${id}` }).then(() => {
      showNotification({
        title: "Success",
        message: "Key deleted",
      });
      reloadApiKeys();
    });
  };

  return (
    <div className={styles.Auth}>
      <h1>Api Keys</h1>
      <h2>New Api Key</h2>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="name"
          className={styles.input}
          value={newApiKey.name}
          onChange={(e) => {
            setNewApiKey({ ...newApiKey, name: e.target.value });
          }}
        />
        <button className={styles.add_button} onClick={addNewApiKey}>
          Add
        </button>
      </div>
      <h2>All Api Keys</h2>
      <div className={styles.apiKeys}>
        {apiKeys?.length ? (
          apiKeys?.map((apiKey) => {
            return (
              <div className={styles.card} key={apiKey.for}>
                <div className={styles.toptext}>{apiKey.for}</div>
                <div className={styles.bottomtext}>
                  {apiKey.for === addedApiKey.name && (
                    <span className={styles.tip}>Copy the key! -{">"}</span>
                  )}
                </div>
                <div className={styles.options}>
                  <button
                    className={styles.delete_button}
                    onClick={() => {
                      if (!apiKey?.id) return;
                      handleDeleteApiKey(apiKey.id);
                    }}
                    title="Delete"
                  >
                    <TrashSimple />
                  </button>
                  {addedApiKey.name === apiKey.for && (
                    <button
                      className={styles.copy_button}
                      onClick={copyKey}
                      title="Copy Key"
                    >
                      <Copy />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>There are no Api Keys.</p>
        )}
      </div>
    </div>
  );
}

export default Auth;
