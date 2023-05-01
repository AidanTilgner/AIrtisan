import React from "react";
import styles from "./index.module.scss";
import { useUser } from "../../contexts/User";
import { SunHorizon, Sun, MoonStars, HandWaving } from "@phosphor-icons/react";
import {
  useGetBots,
  useGetRecentConversations,
} from "../../hooks/fetching/common";
import { useSearchParamsUpdate } from "../../hooks/navigation";
import ConversationCard from "../../components/Cards/Conversation/ConversationCard";
import { useBot } from "../../contexts/Bot";

function index() {
  const { bot } = useBot();

  const getWelcomeMessage = () => {
    // based on time of day
    const date = new Date();
    const hours = date.getHours();
    let message = "";
    let icon = <SunHorizon />;
    if (hours < 12) {
      message = `Good morning! Say hi to ${bot?.name}!`;
    }
    if (hours >= 12 && hours < 16) {
      message = `Good afternoon! Say hi to ${bot?.name}!`;
      icon = <Sun />;
    }
    if (hours >= 16 && hours < 19) {
      message = `Good evening! Say hi to ${bot?.name}!`;
      icon = <SunHorizon />;
    }
    if (hours >= 19) {
      message = `You're up late! Say hi to ${bot?.name}!`;
      icon = <MoonStars />;
    }
    return {
      message,
      icon,
    };
  };

  const welcomeMessage = getWelcomeMessage();
  const WelcomeIcon = () => welcomeMessage.icon;

  const { user } = useUser();

  const { data: recentConversations } = useGetRecentConversations(
    {
      runOnMount: true,
    },
    4
  );

  const { data: bots } = useGetBots({
    runOnMount: true,
  });

  const updateSearchParams = useSearchParamsUpdate();

  return (
    <div className={styles.Home}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message} <WelcomeIcon />
          <HandWaving />
        </p>
        <h1 className={styles.big_text}>
          <strong>{bot?.name}</strong>
          {"'s"} Overview
        </h1>
      </div>
      <div className={styles.quickActions}>
        <button className={`${styles.quickAction} ${styles.btnPrimary}`}>
          See Conversations
        </button>
      </div>
      <div className={styles.recentConversations}>
        <h2>Here are some recent user conversations...</h2>
        <div className={styles.cardList}>
          {recentConversations?.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              onGoTo={(conv) => {
                updateSearchParams(
                  new Map([
                    ["tab", "review"],
                    ["load_conversation", conv.id as unknown as string],
                  ])
                );
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default index;
