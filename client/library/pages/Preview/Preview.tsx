import React from "react";
import styles from "./Preview.module.scss";
import Chatbox from "./Rewire/Chatbox";
import { Button, Flex } from "@mantine/core";

function Preview() {
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
      <h2>Rewire Site</h2>
      <div className={styles.chatboxContainer}>
        <Chatbox />
      </div>
    </div>
  );
}

export default Preview;
