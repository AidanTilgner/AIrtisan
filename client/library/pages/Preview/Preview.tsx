import React from "react";
import styles from "./Preview.module.scss";
import Chatbox from "./Chatbox";
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
          <h1>Preview</h1>
          <Button
            variant="outline"
            onClick={() => {
              sessionStorage.setItem("session_id", "");
              window.location.reload();
            }}
          >
            Refresh Session
          </Button>
        </Flex>
      </div>

      <br />
      <div className={styles.chatboxContainer}>
        <Chatbox />
      </div>
    </div>
  );
}

export default Preview;
