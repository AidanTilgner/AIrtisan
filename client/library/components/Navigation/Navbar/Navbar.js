import React from "react";
import withStyles from "react-css-modules";
import styles from "./Navbar.module.scss";
import { Button } from "@mantine/core";
import { retrainModel } from "../../../helpers/fetching";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className={styles.navbar}>
      <h2 className={styles.title}>Onyx Chat</h2>
      <ul className={styles.items}>
        <li>
          <Link to="/interactive">Interactive</Link>
        </li>
        <li>
          <Link to="/preview">Preview</Link>
        </li>
        {/* <li>
          <Button
            onClick={() => {
              retrainModel();
            }}
            variant="outline"
          >
            Refresh Model
          </Button>
        </li> */}
      </ul>
    </div>
  );
}

export default withStyles(styles)(Navbar);
