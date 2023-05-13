import React, { useState } from "react";
import { Model } from "../../../../documentation/main";
import useFetch from "../../../hooks/useFetch";
import styles from "./ModelData.module.scss";
import { useBot } from "../../../contexts/Bot";

function ModelData() {
  const [modelFile, setModelFile] = useState<Model>();

  const onSuccess = (data: Model) => {
    setModelFile(data);
  };

  const { load } = useFetch<undefined, Model>({
    url: "/training/model",
    onSuccess,
    runOnMount: true,
  });

  const reloadData = async () => {
    load();
  };

  const { bot } = useBot();

  return (
    <div className={styles.Model}>
      <div className={styles.header}>
        <h1>{bot?.name} Model Configuration</h1>
      </div>
      <div>
        <p>Coming soon.</p>
      </div>
    </div>
  );
}

export default ModelData;
