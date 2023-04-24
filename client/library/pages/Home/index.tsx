import React from "react";
import styles from "./index.module.scss";
import { useUser } from "../../contexts/User";

function index() {
  const getWelcomeMessage = () => {
    // based on time of day
    const date = new Date();
    const hours = date.getHours();
    let message = "";
    if (hours < 12) {
      message = "Good morning";
    }
    if (hours >= 12 && hours <= 17) {
      message = "Good afternoon";
    }
    if (hours > 17 && hours <= 24) {
      message = "Good evening";
    }
    return message;
  };

  const { user } = useUser();

  return (
    <div className={styles.Home}>
      <div className={styles.top}>
        <p className={styles.top_text}>{getWelcomeMessage()}</p>
        <h1 className={styles.big_text}>
          Hello, <strong>{user?.username}</strong>
        </h1>
      </div>
      <div>
        <p>
          More content coming soon, maybe check out the{" "}
          <a href="/documentation">documentation</a>.
        </p>
      </div>
    </div>
  );
}

export default index;
