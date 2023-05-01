import React from "react";
import styles from "./Notification.module.scss";
import { Notification as NotificationType } from "../../../../documentation/main";

interface NotificationCardProps {
  notification: NotificationType;
}

function NotificationCard({ notification }: NotificationCardProps) {
  return (
    <div className={`${styles.notification} ${styles[notification.type]}`}>
      <div className={styles.title}>
        <h3>{notification.title}</h3>
      </div>
      <div className={`${styles.content} ${styles[notification.priority]}`}>
        <div className={styles.body}>
          <p>{notification.body}</p>
        </div>
        <div className={styles.actions}>
          {notification.actions.map((a) => {
            return (
              <button
                key={a.title}
                className={`${styles.action} ${styles[a.type]}`}
              >
                {a.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
