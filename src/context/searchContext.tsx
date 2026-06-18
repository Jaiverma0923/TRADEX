"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

type SearchContextType = {
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
};
const SearchContext =
    createContext<SearchContextType | null>(null);

export function SearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
export function useSearch() {
  const context =
    useContext(SearchContext);

  if (!context) {
    throw new Error(
      "useSearch must be used within SearchProvider"
    );
  }

  return context;
}