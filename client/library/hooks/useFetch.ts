import { useCallback, useEffect, useState } from "react";
import { useBot } from "../contexts/Bot";
import { api } from "../helpers/axios";

function useFetch({
  url,
  method = "GET",
  body,
  onSuccess,
  onError,
  headers,
  query,
  bustCache,
}: {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  onSuccess?: (data: unknown) => void;
  onError?: (err: unknown) => void;
  headers?: Record<string, string> | undefined;
  query?: Record<string, string> | undefined;
  bustCache?: boolean;
}) {
  const { bot } = useBot();

  const allQuery: Record<string, string> = {
    ...query,
    bot_id: bot?.id?.toString() || "",
  };

  const readyToRun = !!bot?.id;

  const queryStr = Object.keys(allQuery)
    .map((key) => (allQuery[key] ? `${key}=${allQuery[key]}` : ""))
    .join("&");

  const urlToUse = queryStr ? `${url}?${queryStr}` : url;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<unknown>();

  const load = useCallback(() => {
    if (!readyToRun) return;
    setLoading(true);
    api(urlToUse, {
      method,
      data: body,
      headers,
      cache: bustCache ? false : undefined,
    })
      .then((res) => {
        onSuccess && onSuccess(res.data.data);
        setData(res.data.data);
        return res.data.data;
      })
      .catch((err) => {
        onError && onError(err);
        setData(err);
        return err;
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    urlToUse,
    method,
    body,
    headers,
    bustCache,
    onSuccess,
    onError,
    readyToRun,
  ]);

  useEffect(() => {
    if (!readyToRun) return;
    load();
  }, [
    urlToUse,
    method,
    body,
    headers,
    bustCache,
    onSuccess,
    onError,
    readyToRun,
  ]);

  return {
    loading,
    data,
    load,
  };
}

export default useFetch;
