import React, { useEffect, useMemo } from "react";
import Interactive from "./Interactive/Interactive";
import Converse from "./Converse/Converse";
import styles from "./index.module.scss";
import { SegmentedControl } from "@mantine/core";
import { useSearchParams } from "react-router-dom";

function index() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const [trainingType, setTrainingType] = React.useState<
    "interactive" | "converse"
  >((urlSearchParams.get("tab") as "converse" | "interactive") || "converse");

  useEffect(() => {
    if (urlSearchParams.get("tab") !== trainingType) {
      setUrlSearchParams((prev) => {
        prev.set("tab", trainingType);
        return prev;
      });
    }
  }, []);

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

  return useMemo(
    () => (
      <div className={styles.training}>
        <div className={styles.header}>
          <h2>Training</h2>
          <div className={styles.training_type}>
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
          </div>
        </div>
        <div className={styles.training_type}>
          <TrainingComponent />
        </div>
      </div>
    ),
    [trainingType]
  );
}

export default index;
