import React from "react";
import styles from "./index.module.scss";
import Corpus from "./Corpus/Corpus";
import Context from "./Context/Context";
import ModelData from "./Context/ModelData/ModelData";
import { SegmentedControl } from "@mantine/core";

function index() {
  const [tab, setTab] = React.useState<"corpus" | "context" | "model">(
    "corpus"
  );

  const CurrentTab = () => {
    switch (tab) {
      case "corpus":
        return <Corpus />;
      case "context":
        return <Context />;
      case "model":
        return <ModelData />;
    }
  };

  return (
    <div className={styles.documents}>
      <div className={styles.header}>
        <SegmentedControl
          value={tab}
          onChange={(value) => setTab(value as "corpus" | "context" | "model")}
          data={[
            { label: "Corpus", value: "corpus" },
            { label: "Context", value: "context" },
            { label: "Model", value: "model" },
          ]}
        />
      </div>
      <br />
      <CurrentTab />
    </div>
  );
}

export default index;
