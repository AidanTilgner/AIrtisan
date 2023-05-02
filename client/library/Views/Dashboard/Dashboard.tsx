import React from "react";
import styles from "./Dashboard.module.scss";
import { MoonStars, Sun, SunHorizon } from "@phosphor-icons/react";
import { useUser } from "../../contexts/User";
import SVG from "../../components/Utils/SVG";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  return (
    <div className={styles.Dashboard}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message} <WelcomeIcon />
        </p>
        <h1 className={styles.big_text}>
          Hey <strong>{user?.display_name || user?.username}</strong>!
        </h1>
        <div className={styles.quickActions}>
          <button
            className={`${styles.quickAction} ${styles.btnPrimary}`}
            onClick={() => navigate(`/bots/create`)}
          >
            New Bot
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <SVG.UnderConstruction width="50%" height="50%" />
        <h2>This page is under construction. More is coming soon!</h2>
      </div>
    </div>
  );
}

export default Dashboard;
