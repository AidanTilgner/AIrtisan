import React from "react";
import Interactive from "./Interactive/Interactive";
import Chat from "./Chat/Chat";
import styles from "./index.module.scss";
import { SegmentedControl } from "@mantine/core";

function index() {
  const [trainingType, setTrainingType] = React.useState<
    "interactive" | "chat"
  >("chat");

  const TrainingComponent = () => {
    switch (trainingType) {
      case "interactive":
        return <Interactive />;
      case "chat":
        return <Chat />;
    }
  };

  return (
    <div className={styles.training}>
      <div className={styles.header}>
        <h2>Training</h2>
        <div className={styles.training_type}>
          <SegmentedControl
            value={trainingType}
            onChange={(value) =>
              setTrainingType(value as "interactive" | "chat")
            }
            data={[
              { label: "Chat", value: "chat" },
              { label: "Interactive", value: "interactive" },
            ]}
          />
        </div>
      </div>
      <div className={styles.training_type}>
        <TrainingComponent />
      </div>
    </div>
  );
}

export default index;
