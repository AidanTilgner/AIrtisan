import React, { useMemo } from "react";
import Interactive from "./Interactive/Interactive";
import Converse from "./Converse/Converse";
import styles from "./index.module.scss";
import { useBot } from "../../contexts/Bot";

function index() {
  const [trainingType] = React.useState<"interactive" | "converse">("converse");

  const prevTrainingType = React.useRef(trainingType);

  const TrainingComponent = () => {
    if (prevTrainingType.current !== trainingType) {
      prevTrainingType.current = trainingType;
    }
    switch (trainingType) {
      case "interactive":
        return <Interactive />;
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
          {/* <div className={styles.trainingTypeInput}>
            <SegmentedControl
              value={trainingType}
              onChange={(value) =>
                setTrainingType(value as "interactive" | "converse")
              }
              data={[
                { label: "Converse", value: "converse" },
                { label: "Interactive", value: "interactive" },
              ]}
            />
          </div> */}
        </div>
        <div className={styles.training_type}>
          <TrainingComponent />
        </div>
      </div>
    ),
    [trainingType, bot?.name]
  );
}

export default index;
