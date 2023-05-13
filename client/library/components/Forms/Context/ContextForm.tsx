import React from "react";
import styles from "./Context.module.scss";
import { Context } from "../../../../documentation/main";

interface ContextFormProps {
  onUpdate: (data: { label: string; data: string }) => void;
  afterSubmit?: (intent: string, data: { label: string; data: string }) => void;
  onClose?: () => void;
}

function ContextForm({ afterSubmit, onClose }: ContextFormProps) {
  return (
    <div className={styles.ContextForm}>
      <h1>Context Form</h1>
    </div>
  );
}

export default ContextForm;
