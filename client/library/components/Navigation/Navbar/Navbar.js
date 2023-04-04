import React from "react";
import withStyles from "react-css-modules";
import styles from "./Navbar.module.scss";
import { Button } from "@mantine/core";
import { retrainModel } from "../../../helpers/fetching";

function Navbar() {
  return (
    <div className={styles.navbar}>
      <h2 className={styles.title}>Onyx Chat</h2>
      <Button
        onClick={() => {
          retrainModel();
        }}
        variant="outline"
      >
        Refresh Model
      </Button>
    </div>
  );
}

export default withStyles(styles)(Navbar);
