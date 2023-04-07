import React from "react";
import withStyles from "react-css-modules";
import styles from "./Preview.module.scss";
import Chatbox from "./Chatbox";

function Preview() {
  return (
    <div className={styles.preview}>
      <h1>Preview</h1>
      <br />
      <Chatbox />
    </div>
  );
}

export default withStyles(styles)(Preview);
