import React from "react";
import styles from "./index.module.scss";
import { useSearch } from "../../../contexts/Search";

function Search({ typingDelay }: { typingDelay?: number }) {
  const { setQuery } = useSearch();
  const [timeout, setTimeoutState] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [query, setQueryState] = React.useState<string>("");

  React.useEffect(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
    setTimeoutState(
      setTimeout(() => {
        setQuery(query);
      }, typingDelay || 200)
    );
  }, [query]);

  return (
    <div className={styles.search}>
      <input
        type="text"
        onChange={(e) => setQueryState(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}

export default Search;
