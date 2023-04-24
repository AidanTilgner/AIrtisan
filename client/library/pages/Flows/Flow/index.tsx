import React from "react";
import styles from "./index.module.scss";
import { useGenerateConversationFlow } from "../../../hooks/fetching/common";
import { useParams } from "react-router-dom";

function index() {
  const { conversation_id } = useParams();

  const { data: converation, generateConversationFlow: reload } =
    useGenerateConversationFlow(conversation_id as string, {
      runOnMount: true,
    });

  const flow = converation?.intents_graph;

  return (
    <div className={styles.Flows}>
      <p>This page is coming soon</p>
    </div>
  );
}

export default index;
