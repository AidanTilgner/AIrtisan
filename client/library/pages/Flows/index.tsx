import React from "react";
import styles from "./index.module.scss";
import { Conversation } from "../../../documentation/main";
import { useGetConversations } from "../../hooks/fetching/common";
import { useBot } from "../../contexts/Bot";

function index() {
  const { data: Conversations } = useGetConversations({
    runOnMount: true,
  });

  const { bot } = useBot();

  return (
    <div className={styles.Flows}>
      <header>
        <h1>Flows</h1>
      </header>
      <section>
        <h2>{bot?.name} Master Flow</h2>
        <div className={styles.master_flow}>
          <p>This is coming soon.</p>
        </div>
      </section>
    </div>
  );
}

export default index;
