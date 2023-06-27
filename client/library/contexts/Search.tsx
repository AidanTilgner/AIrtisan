import React, { createContext } from "react";

interface Search {
  query: string;
  setQuery: (query: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const initialSearch: Search = { query: "", setQuery: () => {} };

const SearchContext = createContext<Search>(initialSearch);

const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [query, setQuery] = React.useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
};

const useSearch = () => React.useContext(SearchContext);

export { SearchProvider, useSearch, SearchContext };
