import React, { useMemo } from "react";
import Converse from "./Converse/Converse";
import styles from "./index.module.scss";
import { useBot } from "../../../../contexts/Bot";

function index() {
  const [trainingType] = React.useState<"converse">("converse");

  const prevTrainingType = React.useRef(trainingType);

  const TrainingComponent = () => {
    if (prevTrainingType.current !== trainingType) {
      prevTrainingType.current = trainingType;
    }
    switch (trainingType) {
      case "converse":
        return <Converse />;
    }
  };

  const { bot } = useBot();

  return useMemo(
    () => (
      <div className={styles.training}>
        <div className={styles.header}>
          <h2>Training {bot?.name || "Bot"}</h2>
        </div>
        <p className="resources">
          If {`you're`} interested in learning more about training bots
          effectively, check out our{" "}
          <a href="https://docs.airtisan.app">documentation</a>.
        </p>
        <div className={styles.training_type}>
          <TrainingComponent />
        </div>
      </div>
    ),
    [trainingType, bot?.name]
  );
}

export default index;
