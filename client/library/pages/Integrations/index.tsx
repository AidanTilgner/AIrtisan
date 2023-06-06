import React, { useEffect } from "react";
import styles from "./index.module.scss";
import Preview from "./Preview/Preview";
import Auth from "./Auth/Auth";
import { Flex, SegmentedControl } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useSearchParamsUpdate } from "../../hooks/navigation";
import { Cloud, MonitorPlay } from "@phosphor-icons/react";

type Tabs = "preview" | "api";

function index() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = React.useState<Tabs>(
    (searchParams.get("integration_type") as Tabs) || "preview"
  );

  const updateSearchParams = useSearchParamsUpdate();

  const CurrentTab = () => {
    switch (tab) {
      case "preview":
        return <Preview />;
      case "api":
        return <Auth />;
    }
  };

  useEffect(() => {
    if (
      !searchParams.get("integration_type") ||
      searchParams.get("integration_type") !== tab
    ) {
      updateSearchParams(new Map([["integration_type", tab]]));
    }
  }, [tab]);

  return (
    <div className={styles.integrations}>
      <div className={styles.header}>
        <SegmentedControl
          value={tab}
          onChange={(value) => setTab(value as Tabs)}
          data={[
            {
              label: (
                <Flex align="center" gap={8}>
                  <MonitorPlay size={20} />
                  <span>Preview</span>
                </Flex>
              ),
              value: "preview",
            },
            {
              label: (
                <Flex align="center" gap={8}>
                  <Cloud size={20} />
                  <span>API</span>
                </Flex>
              ),
              value: "api",
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
