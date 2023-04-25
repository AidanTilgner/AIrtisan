import React, { useEffect } from "react";
import Navbar from "../../components/Navigation/TabNavbar/Navbar";
import { BotProvider } from "../../contexts/Bot";
import Preview from "../../pages/Preview/Preview";
import Auth from "../../pages/Auth/Auth";
import ReviewConversations from "../../pages/Review/ReviewConversations";
import Training from "../../pages/Training/";
import Corpus from "../../pages/Corpus/Corpus";
import Overview from "../../pages/Overview";
import Flows from "../../pages/Flows";
import { useUser } from "../../contexts/User";
import styles from "./Bot.module.scss";
import {
  Chat,
  FingerprintSimple,
  MonitorPlay,
  SquaresFour,
  TextColumns,
  TreeStructure,
} from "@phosphor-icons/react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSearchParamsUpdate } from "../../hooks/navigation";

type Tab =
  | "overview"
  | "flows"
  | "training"
  | "corpus"
  | "review"
  | "preview"
  | "auth";

function Bot() {
  const { bot_id } = useParams();

  const { isSuperAdmin } = useUser();

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = React.useState<Tab>(
    (searchParams.get("tab") as Tab) || "overview"
  );

  useEffect(() => {
    if (searchParams.get("tab") !== currentTab) {
      setCurrentTab(searchParams.get("tab") as Tab);
    }
  }, [searchParams]);

  const searchParamsUpdate = useSearchParamsUpdate();

  useEffect(() => {
    if (currentTab && searchParams.get("tab") !== currentTab) {
      searchParamsUpdate(new Map([["tab", currentTab]]));
    }
  }, [currentTab]);

  return (
    <div>
      <BotProvider botId={bot_id}>
        <Navbar
          hasBackToHomeButton
          tabs={[
            {
              name: "Overview",
              id: "overview",
              icon: <SquaresFour />,
              visible: true,
            },
            {
              name: "Flows",
              id: "flows",
              icon: <TreeStructure />,
              visible: true,
            },
            {
              name: "Training",
              id: "training",
              icon: <Chat />,
              visible: true,
            },
            {
              name: "Conversations",
              id: "review",
              icon: <TextColumns />,
              visible: true,
            },
            {
              name: "Corpus",
              id: "corpus",
              icon: <TextColumns />,
              visible: true,
            },
            {
              name: "Preview",
              id: "preview",
              icon: <MonitorPlay />,
              visible: isSuperAdmin,
            },
            {
              name: "Auth",
              id: "auth",
              icon: <FingerprintSimple />,
              visible: isSuperAdmin,
            },
          ]}
          setTab={setCurrentTab}
          currentTab={currentTab}
        />
        <div className={styles.mainContainer}>
          <DisplayCurrentTab currentTab={currentTab} />
        </div>
      </BotProvider>
    </div>
  );
}

export default Bot;

function DisplayCurrentTab({ currentTab }: { currentTab: Tab }) {
  switch (currentTab) {
    case "overview":
      return <Overview />;
    case "flows":
      return <Flows />;
    case "training":
      return <Training />;
    case "corpus":
      return <Corpus />;
    case "review":
      return <ReviewConversations />;
    case "preview":
      return <Preview />;
    case "auth":
      return <Auth />;
  }
}
