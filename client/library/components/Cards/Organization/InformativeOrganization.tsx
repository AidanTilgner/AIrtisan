import React from "react";
import styles from "./InformationOrganization.module.scss";
import { Buildings } from "@phosphor-icons/react";
import { getFormattedAdminName } from "../../../helpers/formating";
import { Organization } from "../../../../documentation/main";

interface OrganizationCardProps {
  organization: Organization;
  onClick?: () => void;
  tag?: string;
}

function InformativeOrganization({
  organization,
  onClick,
  tag,
}: OrganizationCardProps) {
  return (
    <button className={styles.OrganizationCard} onClick={onClick}>
      <div className={styles.top}>
        <div className={styles.icon}>
          <Buildings />
        </div>
        <div className={styles.name}>{organization.name}</div>
        <div className={styles.tags}>
          {tag && <div className={`${styles.tag}`}>{tag}</div>}
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.owner}>
          {getFormattedAdminName(organization.owner)}
        </p>
      </div>
    </button>
  );
}

export default InformativeOrganization;
