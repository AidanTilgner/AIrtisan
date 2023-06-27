import React from "react";
import styles from "./Disclaimer.module.scss";
import { useNavigate } from "react-router-dom";

type Types =
  | "beta"
  | "alpha"
  | "experimental"
  | "deprecated"
  | "stable"
  | "new"
  | "unstable";

interface DisclaimerProps {
  type: Types;
  size: "sm" | "md" | "lg";
  title?: string;
}

function Disclaimer({ type, size, title }: DisclaimerProps) {
  const navigate = useNavigate();

  const typeToText = {
    beta: "Beta",
    alpha: "Alpha",
    experimental: "Experimental",
    deprecated: "Deprecated",
    stable: "Stable",
    new: "New",
    unstable: "Unstable",
  };

  const typeToLabel = {
    beta: "This feature is in beta. Please report any bugs.",
    alpha: "This feature is in alpha. Please report any bugs.",
    experimental: "This feature is experimental. Please report any bugs.",
    deprecated: "This feature is deprecated. Please report any bugs.",
    stable: "This feature is stable.",
    new: "This feature is new.",
    unstable: "This feature is unstable. Please report any bugs.",
  };

  const typeToClick = {
    beta: () => navigate("/feedback"),
    alpha: () => navigate("/feedback"),
    experimental: () => navigate("/feedback"),
    deprecated: () => navigate("/feedback"),
    unstable: () => navigate("/feedback"),
  };

  return (
    <div
      className={`${styles.disclaimer} ${styles[type]} ${
        size ? styles[size] : styles.sm
      }`}
      onClick={typeToClick[type]}
      style={{
        cursor: typeToClick[type] && size !== "sm" ? "pointer" : "default",
      }}
      title={
        title
          ? title
          : `${typeToLabel[type]}${
              typeToClick[type] ? " Click to report." : ""
            }`
      }
    >
      <span className={styles.text}>{typeToText[type]}</span>
    </div>
  );
}

export default Disclaimer;
