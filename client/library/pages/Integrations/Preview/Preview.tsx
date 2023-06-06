import React, { useLayoutEffect } from "react";
import styles from "./Preview.module.scss";
import { Button, Flex } from "@mantine/core";
import {
  addResourceFilesToDocument,
  loadResourcesForPreview,
  previews,
} from "./previews";

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
          <div
            className={`${styles.preview} ${
              p.inline ? styles.inline : styles.floating
            }`}
            key={p.name + p.rootId}
          >
            <h2>{p.name}</h2>
            <p className="disclaimer">{p.disclaimer}</p>
            <div className={styles.chatboxContainer} id={p.rootId}></div>
          </div>
        );
      })}
    </div>
  );
}

export default Preview;
