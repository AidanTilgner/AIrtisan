import React from "react";
import withStyles from "react-css-modules";
import { Link } from "react-router-dom";
import styles from "./Welcome.module.scss";

function Welcome() {
  return (
    <div className={styles.welcome}>
      <h1>Welcome</h1>
      <br />
      <ul>
        <li>
          <Link to="/interactive">Interative Training</Link>
        </li>
        <li>
          <Link to="/preview">Preview Production Bot</Link>
        </li>
      </ul>
    </div>
  );
}

export default withStyles(styles)(Welcome);
