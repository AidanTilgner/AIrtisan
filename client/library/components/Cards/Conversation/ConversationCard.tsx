import React from "react";
import styles from "./ConversationCard.module.scss";
import { Conversation } from "../../../../documentation/main";
import { ArrowRight } from "@phosphor-icons/react";

interface ConversationCardProps {
  conversation: Conversation;
}

function ConversationCard({ conversation }: ConversationCardProps) {
  const getFormattedTimeStamp = (timestamp: string) => {
    const date = new Date(timestamp);

    // find out how long ago that was
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diff / 1000 / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    if (diffInDays < 7) {
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }

    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
  };

  const getLastNChats = (n: number) => {
    return conversation.chats.reverse().slice(0, n).reverse();
  };

  return (
    <div className={styles.ConversationCard}>
      <div className={styles.top}>
        <h3 className={styles.title}>
          {conversation.generated_name || "Unnamed Conversation"}
        </h3>
      </div>
      <div className={styles.middle}>
        <div className={styles.chatsPreview}>
          {getLastNChats(2).map((c) => {
            return (
              <span key={c.id}>
                {c.role === "user" ? "User: " : "Bot: "}
                {c.message}
              </span>
            );
          })}
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.options}>
          <button className={`${styles.bottomOption} ${styles.go}`}>
            <ArrowRight weight="bold" />
          </button>
        </div>
        <p className={styles.timestamp}>
          {getFormattedTimeStamp(
            conversation.chats[conversation.chats.length - 1].created_at
          )}
        </p>
      </div>
    </div>
  );
}

export default ConversationCard;
