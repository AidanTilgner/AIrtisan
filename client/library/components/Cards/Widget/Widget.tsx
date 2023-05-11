import React from "react";
import styles from "./Widget.module.scss";

function Widget({ children, title }: { children: JSX.Element; title: string }) {
  return (
    <div className={styles.widget}>
      <div className={styles.widget_title}>
        <h3>{title}</h3>
      </div>
      <div className={styles.widget_body}>{children}</div>
    </div>
  );
}

export default Widget;
