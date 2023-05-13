import React, { useState } from "react";
import { Model } from "../../../../documentation/main";
import useFetch from "../../../hooks/useFetch";

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

  console.log("Model File", modelFile);
  return <div>ModelData</div>;
}

export default ModelData;
