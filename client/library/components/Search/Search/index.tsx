import React from "react";
import styles from "./index.module.scss";
import { useSearch } from "../../../contexts/Search";

function Search() {
  const { setQuery } = useSearch();

  return (
    <div className={styles.search}>
      <input
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}

export default Search;
