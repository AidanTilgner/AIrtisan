import React, { useEffect } from "react";
import styles from "./index.module.scss";
import Corpus from "./Corpus/Corpus";
import Context from "./Context/Context";
import { Flex, SegmentedControl } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useSearchParamsUpdate } from "../../hooks/navigation";
import { ChatCircle, Table } from "@phosphor-icons/react";

function index() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = React.useState<"corpus" | "context">(
    (searchParams.get("document_type") as "corpus" | "context") || "corpus"
  );

  const updateSearchParams = useSearchParamsUpdate();

  const CurrentTab = () => {
    switch (tab) {
      case "corpus":
        return <Corpus />;
      case "context":
        return <Context />;
    }
  };

  useEffect(() => {
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
          onChange={(value) => setTab(value as "corpus" | "context")}
          data={[
            {
              label: (
                <Flex align="center" gap={8}>
                  <ChatCircle size={20} />
                  <span>Corpus</span>
                </Flex>
              ),
              value: "corpus",
            },
            {
              label: (
                <Flex align="center" gap={8}>
                  <Table size={20} />
                  <span>Context</span>
                </Flex>
              ),
              value: "context",
            },
          ]}
        />
      </div>
      <br />
      <CurrentTab />
    </div>
  );
}

export default index;
