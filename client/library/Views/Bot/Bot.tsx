import React, { useEffect } from "react";
import Navbar from "../../components/Navigation/TabNavbar/Navbar";
import { BotProvider } from "../../contexts/Bot";
import ReviewConversations from "./pages/Review/ReviewConversations";
import Training from "./pages/Training";
import Documents from "./pages/Documents";
import Overview from "./pages/Overview";
import Flows from "./pages/Flows";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import { useUser } from "../../contexts/User";
import styles from "./Bot.module.scss";
import {
  Chat,
  Chats,
  GearSix,
  PuzzlePiece,
  SquaresFour,
  TextColumns,
} from "@phosphor-icons/react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSearchParamsUpdate } from "../../hooks/navigation";

type Tab =
  | "overview"
  | "flows"
  | "training"
  | "documents"
  | "settings"
  | "review"
  | "integrations";

function Bot() {
  const { bot_id } = useParams();

  const { isSuperAdmin } = useUser();

  const [searchParams] = useSearchParams();
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
          tabs={[
            {
              name: "Overview",
              id: "overview",
              icon: <SquaresFour />,
              visible: true,
            },
            // {
            //   name: "Flows",
            //   id: "flows",
            //   icon: <TreeStructure />,
            //   visible: false,
            // },
            {
              name: "Training",
              id: "training",
              icon: <Chat />,
              visible: true,
            },
            {
              name: "Conversations",
              id: "review",
              icon: <Chats />,
              visible: true,
            },
            {
              name: "Documents",
              id: "documents",
              icon: <TextColumns />,
              visible: true,
            },
            {
              name: "Integrations",
              id: "integrations",
              icon: <PuzzlePiece />,
              visible: true,
            },
            {
              name: "Settings",
              id: "settings",
              icon: <GearSix />,
              visible: true,
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
    case "documents":
      return <Documents />;
    case "review":
      return <ReviewConversations />;
    case "integrations":
      return <Integrations />;
    case "settings":
      return <Settings />;
  }
}
