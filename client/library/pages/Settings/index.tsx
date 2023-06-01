import React from "react";
import styles from "./index.module.scss";
import ModelData from "./ModelData/ModelData";

function index() {
  return (
    <div className={styles.settings}>
      <ModelData />
    </div>
  );
}

export default index;
