import React from "react";
import styles from "./Dashboard.module.scss";
import {
  ArrowRight,
  Buildings,
  MoonStars,
  Sun,
  SunHorizon,
  User,
} from "@phosphor-icons/react";
import { useUser } from "../../contexts/User";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mantine/core";
import Widget from "../../components/Cards/Widget/Widget";
import { useGetMyRecentBots } from "../../hooks/fetching/bot";

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
      message = "Hope you're having a good day!";
      icon = <Sun />;
    }
    if (hours >= 16 && hours < 19) {
      message = "Good evening!";
      icon = <SunHorizon />;
    }
    if (hours >= 19) {
      message = "You're up late!";
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

  const formattedDisplayName = (n: string) => {
    const [first] = n.split(" ");
    return `${first}`;
  };

  const { data: myRecentBots } = useGetMyRecentBots({
    runOnMount: true,
  });

  return (
    <div className={styles.Dashboard}>
      <div className={styles.top}>
        <p className={styles.top_text}>
          {welcomeMessage.message} <WelcomeIcon />
        </p>
        <h1 className={styles.big_text}>
          Hey{" "}
          <strong>
            {user?.display_name
              ? formattedDisplayName(user.display_name)
              : user?.username}
          </strong>
          !
        </h1>
        <div className={styles.quickActions}>
          <button
            className={`${styles.quickAction} ${styles.btnPrimary}`}
            onClick={() => navigate(`/bots/create`)}
          >
            New Bot
          </button>
          <button
            className={`${styles.quickAction} ${styles.btnSecondary}`}
            onClick={() => navigate(`/profile/${user?.username}`)}
          >
            Your Profile
          </button>
          <button
            className={`${styles.quickAction} ${styles.btnSecondary}`}
            onClick={() => (window.location.href = "/documentation")}
          >
            Read the Docs
          </button>
        </div>
      </div>
      <div className={styles.content}>
        <Grid>
          <Grid.Col sm={12} md={6}>
            <Widget title="Jump to Bot">
              <div className={styles.jumpbots}>
                {myRecentBots && myRecentBots.length ? (
                  myRecentBots.map((b) => {
                    return (
                      <button
                        className={styles.jumpbot}
                        key={b.id}
                        onClick={() => {
                          navigate(`/bots/${b.id}`);
                        }}
                      >
                        <span>
                          {b.owner_type === "admin" ? <User /> : <Buildings />}
                          {b.name}
                        </span>
                        <ArrowRight />
                      </button>
                    );
                  })
                ) : (
                  <p>No bots</p>
                )}
              </div>
            </Widget>
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}

export default Dashboard;
