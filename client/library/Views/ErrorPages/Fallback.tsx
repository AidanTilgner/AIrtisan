import React from "react";
import styles from "./Fallback.module.scss";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button, Flex } from "@mantine/core";
import SVG from "../../components/Utils/SVG";

function NotFound() {
  const [searchParams] = useSearchParams();

  const reason =
    searchParams.get("reason")?.replaceAll('"', "") || "Something went wrong.";

  const [seconds, setSeconds] = React.useState(60);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const reasonToCTA: {
    [key: string]: () => JSX.Element;
  } = {
    "User not found": () => (
      <Flex align={"center"} direction={"column"}>
        <p>Interested in an account?</p>
        <a href="/signup">
          <Button variant="outline">Make a New Account</Button>
        </a>
      </Flex>
    ),
    "Organization not found": () => (
      <Flex align={"center"} direction={"column"}>
        <p>Interested in an organization?</p>
        <Link to="/organizations/create">
          <Button variant="outline">Create an Organization</Button>
        </Link>
      </Flex>
    ),
  };

  const reasonToIcon: {
    [key: string]: () => JSX.Element;
  } = {
    "User not found": () => <SVG.NotFoundBackdrop width="100%" height="100%" />,
  };

  if (seconds <= 0) return <Navigate to="/" />;

  return (
    <div className={styles["not-found"]}>
      <div className={styles.backgroundImage}>
        {reasonToIcon[reason] && reasonToIcon[reason]()}
      </div>
      <br />
      <h1>{reason}</h1>
      <br />
      <p>
        Oops! Something went wrong. Click to go back home. Page will
        automatically redirect in {seconds} seconds.
      </p>
      <br />
      <Flex
        align={"center"}
        justify={"center"}
        gap={24}
        style={{
          margin: "24px",
        }}
      >
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
        <a href="/help/support">
          <Button variant="default">Contact Support</Button>
        </a>
      </Flex>
      {reasonToCTA[reason] && reasonToCTA[reason]()}
    </div>
  );
}

export default NotFound;
