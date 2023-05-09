import React from "react";
import styles from "./index.module.scss";
import { SunHorizon, Sun, MoonStars, HandWaving } from "@phosphor-icons/react";
import { useGetRecentConversations } from "../../hooks/fetching/common";
import { useSearchParamsUpdate } from "../../hooks/navigation";
import ConversationCard from "../../components/Cards/Conversation/ConversationCard";
import { useBot } from "../../contexts/Bot";
import { usePauseBot, useStartupBot } from "../../hooks/fetching/bot";

function index() {
  const { bot, isRunning, reloadBot, isLoading } = useBot();

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

  const { data: recentConversations } = useGetRecentConversations(
    {
      runOnMount: true,
    },
    4
  );

  const updateSearchParams = useSearchParamsUpdate();

  const { startupBot } = useStartupBot(bot?.id as number, {
    dependencies: [bot?.id],
  });

  const handleStartBot = async () => {
    await startupBot();
    await reloadBot();
  };

  const { pauseBot } = usePauseBot(bot?.id as number, {
    dependencies: [bot?.id],
  });

  const handleStopBot = async () => {
    await pauseBot();
    await reloadBot();
  };

  return (
    <div className={styles.Home}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message}
          <span className={styles.iconContainer}>
            <WelcomeIcon />
          </span>
          <span className={styles.shake}>
            <HandWaving />
          </span>
        </p>
        <h1 className={styles.big_text}>
          <strong>{bot?.name}</strong>
          {"'s"} Overview
        </h1>
        <p className={styles.bottom_text}>
          {isRunning ? (
            <span className={styles.running}>{bot?.name} is running</span>
          ) : (
            <span className={styles.stopped}>{bot?.name} is not running</span>
          )}
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.quickActions}>
          <button
            className={`${styles.quickAction} ${styles.btnPrimary}`}
            onClick={() => {
              updateSearchParams(new Map([["tab", "review"]]));
            }}
          >
            See Conversations
          </button>
          {isRunning ? (
            <button
              className={`${styles.quickAction} ${styles.btnPause}`}
              onClick={handleStopBot}
              disabled={isLoading}
            >
              Stop Bot
            </button>
          ) : (
            <button
              className={`${styles.quickAction} ${styles.btnStartup}`}
              onClick={handleStartBot}
              disabled={isLoading}
            >
              Start Bot
            </button>
          )}
        </div>
        <div className={styles.recentConversations}>
          <h2>Here are some recent user conversations...</h2>
          <div className={styles.cardList}>
            {recentConversations && recentConversations.length ? (
              recentConversations.map((conversation) => (
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
              ))
            ) : (
              <p>No recent conversations found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default index;
