import React from "react";
import styles from "./Dashboard.module.scss";
import { MoonStars, Sun, SunHorizon } from "@phosphor-icons/react";
import { useUser } from "../../contexts/User";

function Dashboard() {
  const getWelcomeMessage = () => {
    // based on time of day
    const date = new Date();
    const hours = date.getHours();
    let message = "";
    let icon = <SunHorizon />;
    if (hours < 12) {
      message = "Good morning!";
    }
    if (hours >= 12 && hours < 16) {
      message = "Hi there, hope you're having a good day!";
      icon = <Sun />;
    }
    if (hours >= 16 && hours < 19) {
      message = "Good evening, welcome!";
      icon = <SunHorizon />;
    }
    if (hours >= 19) {
      message = "Welcome, you're up late!";
      icon = <MoonStars />;
    }
    return {
      message,
      icon,
    };
  };

  const welcomeMessage = getWelcomeMessage();
  const WelcomeIcon = () => welcomeMessage.icon;

  const { user } = useUser();

  return (
    <div className={styles.Dashboard}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message} <WelcomeIcon />
        </p>
        <h1 className={styles.big_text}>
          Hey <strong>{user?.username}</strong>!
        </h1>
        <div className={styles.quickActions}>
          <button className={`${styles.quickAction} ${styles.btnPrimary}`}>
            Do something
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <p>More coming soon.</p>
      </div>
    </div>
  );
}

export default Dashboard;
