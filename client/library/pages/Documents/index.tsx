import React from "react";
import styles from "./index.module.scss";
import Corpus from "./Corpus/Corpus";
import Context from "./Context/Context";
import ModelData from "./ModelData/ModelData";
import { SegmentedControl } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useSearchParamsUpdate } from "../../hooks/navigation";

function index() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = React.useState<"corpus" | "context" | "model">(
    (searchParams.get("document_type") as "corpus" | "context" | "model") ||
      "corpus"
  );

  const updateSearchParams = useSearchParamsUpdate();

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

  React.useEffect(() => {
    if (
      !searchParams.get("document_type") ||
      searchParams.get("document_type") !== tab
    ) {
      updateSearchParams(new Map([["document_type", tab]]));
    }
  }, [tab]);

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
