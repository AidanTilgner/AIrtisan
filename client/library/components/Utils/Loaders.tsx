import React from "react";
import styles from "./Loaders.module.scss";

export const Spinner = () => {
  return (
    <div className={styles["lds-ring"]}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default {
  Spinner,
};
