import React, { useLayoutEffect } from "react";
import styles from "./Preview.module.scss";
import { Button, Flex } from "@mantine/core";
import {
  addResourceFilesToDocument,
  loadResourcesForPreview,
  previews,
} from "./previews";
import { Prism } from "@mantine/prism";
import { useBot } from "../../../../../contexts/Bot";

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

  const { bot } = useBot();

  const addVariables = (original: string) => {
    let newString = original;

    newString = newString.replace(/\[your bot slug\]/g, `"${bot?.slug}"` || "");

    newString = newString.replace(/\[your bot name\]/g, `"${bot?.name}"` || "");

    return newString;
  };

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
          <h1>Widgets</h1>
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
            <h2>
              {p.name} {p.version && <span className="beta">{p.version}</span>}
            </h2>
            <p className="disclaimer no-border">{p.disclaimer}</p>
            {p.rootId && (
              <div className={styles.chatboxContainer} id={p.rootId}></div>
            )}
            <div className={styles.addToSite}>
              <h3>Add it to your site:</h3>
              <div className={styles.code}>
                <Prism language="markup">{addVariables(p.code)}</Prism>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Preview;
