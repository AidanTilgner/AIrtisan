import React, { useState } from "react";
import { Context, Model } from "../../../../documentation/main";
import useFetch from "../../../hooks/useFetch";
import { useBot } from "../../../contexts/Bot";
import styles from "./Context.module.scss";

function Context() {
  const [contextFile, setcontextFile] = useState<Context>();

  const onSuccess = (data: Context) => {
    setcontextFile(data);
  };

  const { load } = useFetch<undefined, Context>({
    url: "/training/context",
    onSuccess,
    runOnMount: true,
  });

  const reloadData = async () => {
    load();
  };

  const { bot } = useBot();

  return (
    <div className={styles.Context}>
      <div className={styles.header}>
        <h1>{bot?.name} Context</h1>
      </div>
      <div>
        <p>Coming soon.</p>
      </div>
    </div>
  );
}

export default Context;
