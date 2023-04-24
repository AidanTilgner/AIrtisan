import React from "react";
import styles from "./index.module.scss";
import { useUser } from "../../contexts/User";
import { SunHorizon, Sun, MoonStars } from "@phosphor-icons/react";
import {
  useGetBots,
  useGetRecentConversations,
} from "../../hooks/fetching/common";
import ConversationCard from "../../components/Cards/Conversation/ConversationCard";

function index() {
  const getWelcomeMessage = () => {
    // based on time of day
    const date = new Date();
    const hours = date.getHours();
    let message = "";
    let icon = <SunHorizon />;
    if (hours < 12) {
      message = "Good morning";
    }
    if (hours >= 12 && hours <= 17) {
      message = "Good afternoon";
      icon = <Sun />;
    }
    if (hours > 17 && hours <= 24) {
      message = "Good evening";
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

  const { data: recentConversations } = useGetRecentConversations({
    runOnMount: true,
  });

  console.log("Recent conversations", recentConversations);

  const { data: bots } = useGetBots({
    runOnMount: true,
  });

  console.log("Bots", bots);

  return (
    <div className={styles.Home}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message} <WelcomeIcon />
        </p>
        <h1 className={styles.big_text}>
          Hello, <strong>{user?.username}</strong>
        </h1>
      </div>
      <div className={styles.quickActions}>
        <p>
          More content coming soon, maybe check out the{" "}
          <a href="/documentation">documentation</a>.
        </p>
      </div>
      <div className={styles.recentConversations}>
        <h2>Here are some recent user conversations...</h2>
        <div className={styles.cardList}>
          {recentConversations?.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default index;
