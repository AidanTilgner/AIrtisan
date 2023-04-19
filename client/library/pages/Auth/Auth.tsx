import React, { useEffect } from "react";
import styles from "./Auth.module.scss";
import {
  getAdmins,
  addAdmin,
  deleteAdmin,
  addApiKey,
  deleteApiKey,
  getAllApiKeys,
} from "../../helpers/fetching/admin";
import { TrashSimple, Copy } from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";
import { Admin, ApiKey } from "../../../documentation/main";

function Auth() {
  const [admins, setAdmins] = React.useState<Admin[]>([]);
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);

  useEffect(() => {
    getAdmins().then((res) => {
      if ("error" in res) {
        return showNotification({
          title: "Error",
          message: res.error,
        });
      }
      const { admins } = res;
      setAdmins(admins);
    });
    getAllApiKeys().then(({ api_keys }) => {
      setApiKeys(api_keys);
    });
  }, []);

  const [newAdmin, setNewAdmin] = React.useState({
    username: "",
    role: "admin",
  });

  const [addedAdmin, setAddedAdmin] = React.useState({
    username: "",
    password: "",
  });

  const addNewAdmin = () => {
    if (!newAdmin.username || !newAdmin.role) return;
    addAdmin(newAdmin).then((res) => {
      if ("error" in res) {
        return showNotification({
          title: "Error",
          message: res.error,
        });
      }
      const { username, password } = res;
      setNewAdmin({ username: "", role: "admin" });
      setAddedAdmin({
        username,
        password,
      });
      getAdmins().then((res) => {
        if ("error" in res) {
          return showNotification({
            title: "Error",
            message: res.error,
          });
        }
        const { admins } = res;
        setAdmins(admins);
      });
    });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(addedAdmin.password);
    showNotification({
      title: "Copied!",
      message: "Password copied to clipboard",
    });
  };

  const handleDeleteAdmin = (id: number) => {
    deleteAdmin({ id }).then(() => {
      showNotification({
        title: "Success",
        message: "Admin deleted",
      });
      getAdmins().then((res) => {
        if ("error" in res) {
          return showNotification({
            title: "Error",
            message: res.error,
          });
        }
        setAdmins(admins);
      });
    });
  };

  const [newApiKey, setNewApiKey] = React.useState({
    name: "",
  });

  const [addedApiKey, setAddedApiKey] = React.useState({
    name: "",
    key: "",
  });

  const addNewApiKey = () => {
    if (!newApiKey.name) return;
    addApiKey(newApiKey).then(({ api_key }) => {
      setNewApiKey({ name: "" });
      setAddedApiKey({
        name: api_key.for,
        key: api_key.key,
      });
      getAllApiKeys().then(({ api_keys }) => {
        setApiKeys(api_keys);
      });
    });
  };

  const copyKey = () => {
    navigator.clipboard.writeText(addedApiKey.key);
    showNotification({
      title: "Copied!",
      message: "Key copied to clipboard",
    });
  };

  const handleDeleteApiKey = (id: number) => {
    deleteApiKey({ id }).then(() => {
      showNotification({
        title: "Success",
        message: "Key deleted",
      });
      getAllApiKeys().then(({ api_key }) => {
        setApiKeys(api_key);
      });
    });
  };

  return (
    <div className={styles.Auth}>
      <h1>Admins</h1>
      <h2>New Admin</h2>
      <div className={styles.form}>
        <input
          type="text"
          placeholder="username"
          className={styles.input}
          value={newAdmin.username}
          onChange={(e) => {
            setNewAdmin({ ...newAdmin, username: e.target.value });
          }}
        />
        <select
          className={styles.select}
          value={newAdmin.role}
          onChange={(e) => {
            setNewAdmin({ ...newAdmin, role: e.target.value });
          }}
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <button className={styles.add_button} onClick={addNewAdmin}>
          Add
        </button>
      </div>
      <h2>All Admins</h2>
      <div className={styles.admins}>
        {admins.length ? (
          admins.map((admin) => {
            return (
              <div className={styles.card} key={admin.username}>
                <div className={styles.toptext}>{admin.username}</div>
                <div className={styles.bottomtext}>
                  {admin.role}{" "}
                  {admin.username === addedAdmin.username && (
                    <span className={styles.tip}>
                      -{">"} Password: {addedAdmin.password}
                    </span>
                  )}
                </div>
                <div className={styles.options}>
                  <button
                    className={styles.delete_button}
                    onClick={() => {
                      if (!admin?.id) return;
                      handleDeleteAdmin(admin.id);
                    }}
                    title="Delete"
                  >
                    <TrashSimple />
                  </button>
                  {addedAdmin.username === admin.username && (
                    <button
                      className={styles.copy_button}
                      onClick={copyPassword}
                      title="Copy Password"
                    >
                      <Copy />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>There are no admins.</p>
        )}
      </div>
      <hr />
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
