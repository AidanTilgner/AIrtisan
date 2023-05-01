import React from "react";
import styles from "./BotCard.module.scss";
import { Bot } from "../../../../documentation/main";
import { Robot } from "@phosphor-icons/react";
import { getFormattedBotOwner } from "../../../helpers/formating";

interface BotCardProps {
  bot: Bot;
  onClick?: () => void;
}

function BotCard({ bot, onClick }: BotCardProps) {
  return (
    <button className={styles.BotCard} onClick={onClick}>
      <div className={styles.top}>
        <div className={styles.icon}>
          <Robot />
        </div>
        <div className={styles.name}>{bot.name}</div>
        <div className={styles.tags}>
          {bot.running !== undefined && bot.running !== null && (
            <div
              className={`${styles.tag} ${
                bot.running ? styles.running : styles.not_running
              }`}
            >
              {bot.running ? "Running" : "Not running"}
            </div>
          )}
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.owner}>{getFormattedBotOwner(bot)}</p>
      </div>
    </button>
  );
}

export default BotCard;
