import { useState } from "react";
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
  body?: any;
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
  headers?: Record<string, any> | undefined;
  query?: Record<string, any> | undefined;
  bustCache?: boolean;
}) {
  const { bot } = useBot();

  const allQuery: Record<string, any> = {
    ...query,
    bot_id: bot?.id || "",
  };

  const queryStr = Object.keys(allQuery)
    .map((key) => (allQuery[key] ? `${key}=${allQuery[key]}` : ""))
    .join("&");

  const urlToUse = queryStr ? `${url}?${queryStr}` : url;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>();

  const instance = api(urlToUse, {
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

  const reload = () => {
    setLoading(true);
    instance
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
  };

  return {
    loading,
    instance,
    data,
    reload,
  };
}

export default useFetch;
