import React from "react";
import styles from "./AdminCard.module.scss";
import { Person, User } from "@phosphor-icons/react";
import { getFormattedAdminName } from "../../../helpers/formating";
import { Admin } from "../../../../documentation/main";

interface AdminCardProps {
  admin: Admin;
  onClick?: () => void;
  tag?: string;
}

function AdminCard({ admin, onClick, tag }: AdminCardProps) {
  return (
    <button className={styles.AdminCard} onClick={onClick}>
      <div className={styles.top}>
        <div className={styles.icon}>
          <User />
        </div>
        <div className={styles.name}>{getFormattedAdminName(admin)}</div>
        <div className={styles.tags}>
          {tag && <div className={`${styles.tag}`}>{tag}</div>}
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.owner}>{admin.username}</p>
      </div>
    </button>
  );
}

export default AdminCard;
