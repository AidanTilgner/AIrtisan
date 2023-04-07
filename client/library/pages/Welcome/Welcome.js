import React from "react";
import withStyles from "react-css-modules";
import { Link } from "react-router-dom";
import { useUser } from "../../contexts/User";
import styles from "./Welcome.module.scss";

function Welcome() {
  const { isSuperAdmin } = useUser();

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
        <li>
          <Link to="/review/conversations">Review wonky conversations</Link>
        </li>
        {isSuperAdmin && (
          <li>
            <Link to="/admin/auth">Handle some auth</Link>
          </li>
        )}
      </ul>
    </div>
  );
}

export default withStyles(styles)(Welcome);
