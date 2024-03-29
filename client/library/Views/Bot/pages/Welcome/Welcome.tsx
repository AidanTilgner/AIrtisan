import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../../../contexts/User";
import styles from "./Welcome.module.scss";

function Welcome() {
  const { isSuperAdmin } = useUser();

  return (
    <div className={styles.welcome}>
      <h1>Welcome</h1>
      <br />
      <ul>
        <li>
          Read the <a href="/documentation">documentation</a>
        </li>
        <li>
          <Link to="/interactive">Interative Training</Link>
        </li>
        <li>
          <Link to="/preview">Preview Production Bots</Link>
        </li>
        <li>
          <Link to="/review/conversations">Review wonky conversations</Link>
        </li>
        {isSuperAdmin && (
          <li>
            <Link to="/admin/auth">Handle some auth</Link>
          </li>
        )}
        <li>
          Something wrong?{" "}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            clear
          </button>{" "}
          your cookies and local storage and try again.
        </li>
      </ul>
    </div>
  );
}

export default Welcome;
