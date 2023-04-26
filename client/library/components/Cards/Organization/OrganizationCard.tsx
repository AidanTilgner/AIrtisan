import React from "react";
import styles from "./OrganizationCard.module.scss";
import { Organization } from "../../../../documentation/main";
import { Buildings } from "@phosphor-icons/react";

interface OrganizationCardProps {
  organization: Organization;
  onClick?: () => void;
}

function OrganizationCard({ organization, onClick }: OrganizationCardProps) {
  return (
    <button
      className={styles.OrganizationCard}
      onClick={onClick}
      title={`${organization.name}`}
    >
      <div className={styles.iconContainer}>
        <Buildings />
      </div>
      <div>
        <div className={styles.name}>
          <span>{organization.name}</span>
        </div>
      </div>
    </button>
  );
}

export default OrganizationCard;
