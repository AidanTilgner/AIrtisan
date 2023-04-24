import React from "react";
import styles from "./index.module.scss";
import { useUser } from "../../contexts/User";
import { SunHorizon, Sun, MoonStars } from "@phosphor-icons/react";
import {
  useGetBots,
  useGetRecentConversations,
} from "../../hooks/fetching/common";
import ConversationCard from "../../components/Cards/Conversation/ConversationCard";
import { useSearchParams } from "react-router-dom";

function index() {
  const getWelcomeMessage = () => {
    // based on time of day
    const date = new Date();
    const hours = date.getHours();
    let message = "";
    let icon = <SunHorizon />;
    if (hours < 12) {
      message = "Good morning!";
    }
    if (hours >= 12 && hours < 16) {
      message = "Hi there, hope you're having a good day!";
      icon = <Sun />;
    }
    if (hours >= 16 && hours < 19) {
      message = "Good evening, welcome!";
      icon = <SunHorizon />;
    }
    if (hours >= 19) {
      message = "Welcome, it's great to have you here!";
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

  console.log("Bots", bots);
  const [searchParams] = useSearchParams();

  return (
    <div className={styles.Home}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message} <WelcomeIcon />
        </p>
        <h1 className={styles.big_text}>
          <strong>{user?.username}</strong>
          {"'s"} Dashboard
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
                searchParams.set("tab", "review");
                searchParams.set(
                  "load_conversation",
                  conv.id as unknown as string
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
