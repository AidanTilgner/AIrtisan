import React, { useLayoutEffect } from "react";
import styles from "./Preview.module.scss";
import { Button, Flex } from "@mantine/core";
import {
  addResourceFilesToDocument,
  loadResourcesForPreview,
  previews,
} from "./previews";

interface ChatURL {
  url: (...args: unknown[]) => string;
  headers: {
    "Content-Type": string;
    "x-access-token": string;
  };
}

(
  window as unknown as {
    chat_urls: {
      [key: string]: ChatURL;
    };
  }
).chat_urls = {};

const useChatURL: ChatURL = {
  url: () =>
    `/api/chat/as_admin?bot_id=${localStorage.getItem("lastUsedBotID")}`,
  headers: {
    "Content-Type": "application/json",
    "x-access-token": localStorage.getItem("accessToken") || "",
  },
};

(
  window as unknown as {
    chat_urls: {
      [key: string]: ChatURL;
    };
  }
).chat_urls.useChatEndpoint = useChatURL;

const reviewChatURL: ChatURL = {
  url: (chat_id) => {
    return `/api/chat/as_admin/${chat_id}/should_review`;
  },
  headers: {
    "Content-Type": "application/json",
    "x-access-token": localStorage.getItem("accessToken") || "",
  },
};

(
  window as unknown as {
    chat_urls: {
      [key: string]: ChatURL;
    };
  }
).chat_urls.reviewChatURL = reviewChatURL;

function Preview() {
  useLayoutEffect(() => {
    const promises = previews.map(async (p) => {
      const resources = await loadResourcesForPreview(p.name);
      if (!resources || !resources.widgetJs || !resources.widgetCss) {
        return;
      }
      addResourceFilesToDocument(resources?.widgetJs, resources?.widgetCss);
    });
    Promise.all(promises);
  }, []);
  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <Flex
          align="center"
          justify="space-between"
          style={{
            width: "100%",
          }}
        >
          <h1>Previews</h1>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
          >
            Refresh Session
          </Button>
        </Flex>
      </div>
      <br />
      {previews.map((p) => {
        return (
          <div className={styles.preview} key={p.name + p.rootId}>
            <h2>{p.name}</h2>
            <div className={styles.chatboxContainer} id={p.rootId}></div>
          </div>
        );
      })}
    </div>
  );
}

export default Preview;
