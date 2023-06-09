import React, { useEffect } from "react";
import styles from "./index.module.scss";
import ModelData from "./ModelData/ModelData";
import General from "./General/General";
import { useSearchParams } from "react-router-dom";
import { useSearchParamsUpdate } from "../../../../hooks/navigation";
import { Flex, SegmentedControl } from "@mantine/core";
import { Faders, Wrench } from "@phosphor-icons/react";

type Tabs = "general" | "config";

function index() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = React.useState<Tabs>(
    (searchParams.get("settings_type") as Tabs) || "config"
  );

  const updateSearchParams = useSearchParamsUpdate();

  const CurrentTab = () => {
    switch (tab) {
      case "config":
        return <ModelData />;
      case "general":
        return <General />;
    }
  };

  useEffect(() => {
    if (
      !searchParams.get("settings_type") ||
      searchParams.get("settings_type") !== tab
    ) {
      updateSearchParams(new Map([["settings_type", tab]]));
    }
  }, [tab]);

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <SegmentedControl
          value={tab}
          onChange={(value) => setTab(value as Tabs)}
          data={[
            {
              label: (
                <Flex align="center" gap={8}>
                  <Faders size={20} />
                  <span>Config</span>
                </Flex>
              ),
              value: "config",
            },
            {
              label: (
                <Flex align="center" gap={8}>
                  <Wrench size={20} />
                  <span>General</span>
                </Flex>
              ),
              value: "general",
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
