import React from "react";
import styles from "./Auth.module.scss";
import { TrashSimple, Copy } from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";
import {
  useAddApiKey,
  useDeleteApiKey,
  useGetApiKeys,
} from "../../../../../hooks/fetching/bot";
import {
  Button,
  CopyButton,
  Flex,
  SegmentedControl,
  TextInput,
} from "@mantine/core";
import { useBot } from "../../../../../contexts/Bot";
import { Prism } from "@mantine/prism";

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

  const { bot } = useBot();

  const [codeToShow, setCodeToShow] = React.useState<"curl" | "js" | "py">(
    "curl"
  );

  const curlCodeSnippet = `curl -H "x-api-key: ${
    addedApiKey.key || "YOUR_API_KEY"
  }"
  -H "x-service: ${addedApiKey.name || "YOUR_API_KEY_SERVICE_NAME"}"
  -H "Content-Type: application/json"
  -X POST -d '{"message": "Hello"}'
  https://airtisan.app/api/v1/bots/${bot?.slug || "YOUR BOT SLUG"}/chat`;

  const jsCodeSnippet = `fetch("https://airtisan.app/api/v1/bots/${
    bot?.slug
  }/chat", {
    method: 'POST',
    headers: {
      'x-api-key': ${addedApiKey.key || "YOUR_API_KEY"},
      'x-service': ${addedApiKey.name || "YOUR_API_KEY_SERVICE_NAME"},
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello'
    })
  });`;

  return (
    <div className={styles.Auth}>
      <h1>API Keys</h1>
      <div className={styles.description}>
        <p>
          API keys allow you to access your bot programmatically using the REST
          API. Just type the name of the service that {`you'd`} like to generate
          a key for, and click {`"Add"`}.
        </p>
        <p>
          Then, make a request using the key in the header, and the service
          name. For example:
        </p>
        <div className={styles.code_explanation}>
          <SegmentedControl
            value={codeToShow}
            onChange={(value) => setCodeToShow(value as "curl" | "js")}
            data={[
              { label: "cURL", value: "curl" },
              { label: "JavaScript", value: "js" },
            ]}
            size="xs"
          />
          <br />
          <br />
          {codeToShow === "curl" && (
            <Prism language="bash">{curlCodeSnippet}</Prism>
          )}
          {codeToShow === "js" && (
            <Prism language="javascript">{jsCodeSnippet}</Prism>
          )}
        </div>
        <br />
        <div>
          <CopyButton value={bot?.slug ? bot.slug : ""}>
            {({ copied, copy }) => (
              <Button variant={copied ? "outline" : "filled"} onClick={copy}>
                {copied ? "Copied url" : "Copy Bot ID"}
              </Button>
            )}
          </CopyButton>
        </div>
      </div>
      <div className={styles.form}>
        <Flex
          align={"center"}
          justify={"space-between"}
          style={{
            width: "100%",
          }}
        >
          <TextInput
            label="New API Key"
            type="text"
            placeholder="name"
            value={newApiKey.name}
            onChange={(e) => {
              setNewApiKey({ ...newApiKey, name: e.target.value });
            }}
            style={{
              width: "75%",
            }}
          />
          <Button
            variant="filled"
            onClick={addNewApiKey}
            style={{
              marginTop: "24px",
            }}
          >
            Add
          </Button>
        </Flex>
        <br />
      </div>
      <h2>All API Keys</h2>
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
