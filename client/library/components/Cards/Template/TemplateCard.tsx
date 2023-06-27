import React from "react";
import styles from "./TemplateCard.module.scss";
import { Template } from "../../../../documentation/main";
import { Clipboard } from "@phosphor-icons/react";
import { getFormattedBotOwner } from "../../../helpers/formating";

interface TemplateCardProps {
  template: Template;
  onClick?: () => void;
}

function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <button className={styles.templateCard} onClick={onClick}>
      <div className={styles.top}>
        <div className={styles.icon}>
          <Clipboard />
        </div>
        <div className={styles.name}>{template.name}</div>
        <div className={styles.tags}>
          {template.owner_type === "admin" && (
            <div className={`${styles.tag}`}>User Owned</div>
          )}
          {template.owner_type === "organization" && (
            <div className={`${styles.tag}`}>System Owned</div>
          )}
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.description}>{template.description}</p>
      </div>
    </button>
  );
}

export default TemplateCard;
