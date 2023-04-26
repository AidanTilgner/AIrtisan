import React from "react";
import styles from "./BotCard.module.scss";
import { Bot } from "../../../../documentation/main";
import { Robot } from "@phosphor-icons/react";

interface BotCardProps {
  bot: Bot;
}

function BotCard({ bot }: BotCardProps) {
  return (
    <div className={styles.BotCard}>
      <div className={styles.top}>
        <div className={styles.icon}>
          <Robot />
        </div>
        <div className={styles.name}>{bot.name}</div>
        <div className={styles.tags}>
          <div
            className={`${styles.tag} ${
              bot.running ? styles.running : styles.not_running
            }`}
          >
            {bot.running ? "Running" : "Not running"}
          </div>
        </div>
      </div>
      <div className={styles.body}></div>
    </div>
  );
}

export default BotCard;
