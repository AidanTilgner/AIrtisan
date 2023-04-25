import { useSearchParams } from "react-router-dom";

export const useSearchParamsUpdate = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (updates: Map<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    updates.forEach((value, key) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };
};
