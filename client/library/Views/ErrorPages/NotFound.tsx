import React from "react";
import styles from "./NotFound.module.scss";
import { Link } from "react-router-dom";
import { Button, Flex } from "@mantine/core";
import SVG from "../../components/Utils/SVG";

function NotFound() {
  return (
    <div className={styles["not-found"]}>
      <div className={styles.backgroundImage}>
        <SVG.NotFoundBackdrop width="100%" height="100%" />
      </div>
      <br />
      <h1>404 Not Found</h1>
      <br />
      <p>
        Oops something went wrong. Click <Link to="/">here</Link> to go back
        home.
      </p>
      <Flex align={"center"} justify={"center"}>
        <Link to="/">
          <Button>Go Back</Button>
        </Link>
      </Flex>
    </div>
  );
}

export default NotFound;
