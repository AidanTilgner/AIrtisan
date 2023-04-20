import React from "react";
import styles from "./index.module.scss";
import { useSearch } from "../../../contexts/Search";
import { X } from "@phosphor-icons/react";

function Search({ typingDelay }: { typingDelay?: number }) {
  const { setQuery, query: contextQuery } = useSearch();
  const [timeout, setTimeoutState] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [query, setQueryState] = React.useState<string>(contextQuery);

  React.useEffect(() => {
    if (query !== contextQuery) {
      setQueryState(contextQuery);
    }
  }, [contextQuery]);

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
        value={query || ""}
      />
      <button
        className={styles.clearSearch}
        onClick={() => {
          setQueryState("");
          setQuery("");
        }}
      >
        <X />
      </button>
    </div>
  );
}

export default Search;
