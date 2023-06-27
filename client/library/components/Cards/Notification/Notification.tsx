import React from "react";
import styles from "./Notification.module.scss";
import { Notification as NotificationType } from "../../../../documentation/main";
import { useNavigate } from "react-router-dom";

interface NotificationCardProps {
  notification: NotificationType;
}

function NotificationCard({ notification }: NotificationCardProps) {
  const navigate = useNavigate();

  const actionMappings: Record<
    string,
    {
      onClick: (...args: any[]) => void;
      retrieveMetadata: (metadata: Record<string, any>) => any;
    }
  > = {
    view_organization_invitation: {
      onClick: (org_id: number) => {
        navigate(`/organizations/${org_id}`);
      },
      retrieveMetadata: (metadata: Record<string, any>) => {
        const organization_id = metadata.organization.id;
        return organization_id;
      },
    },
  };

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
                onClick={() => {
                  if (actionMappings[a.type]) {
                    actionMappings[a.type]?.onClick(
                      actionMappings[a.type].retrieveMetadata(
                        notification.metadata
                      )
                    );
                  }
                }}
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
