import { useCallback, useEffect, useState } from "react";
import { useBot } from "../contexts/Bot";
import { api } from "../helpers/axios";
import { DefaultResponse } from "../../documentation/server";

export interface UseFetchConfig<B, D> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: B;
  onSuccess?: (data: D) => void;
  onError?: (err: unknown) => void;
  headers?: Record<string, string> | undefined;
  query?: Record<string, string> | undefined;
  bustCache?: boolean;
  runOnMount?: boolean;
}

function useFetch<B, D>({
  url,
  method = "GET",
  body,
  onSuccess,
  onError,
  headers,
  query,
  bustCache,
  runOnMount = false,
}: UseFetchConfig<B, D>) {
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
  const [data, setData] = useState<D>();
  const [success, setSuccess] = useState(false);

  const load = useCallback(
    async (loadConfig?: { updatedUrl?: string; updatedBody?: B }) => {
      if (!readyToRun) return;
      setLoading(true);
      return api<DefaultResponse<D>>(loadConfig?.updatedUrl || urlToUse, {
        method,
        data: {
          ...(loadConfig?.updatedBody || body),
          bot_id: bot?.id,
        },
        headers,
        cache: bustCache ? false : undefined,
      })
        .then((res) => {
          onSuccess && onSuccess(res.data.data as D);
          setData(res.data.data);
          setSuccess(true);
          return res.data;
        })
        .catch((err) => {
          onError && onError(err);
          setData(undefined);
          setSuccess(false);
          return {
            error: err,
            success: false,
            data: null,
          } as DefaultResponse<null>;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [urlToUse, method, body, headers, bustCache, onSuccess, onError, readyToRun]
  );

  useEffect(() => {
    if (!readyToRun) return;
    if (runOnMount) {
      load({
        updatedUrl: urlToUse,
        updatedBody: body,
      });
    }
  }, [
    urlToUse,
    method,
    body,
    headers,
    bustCache,
    onSuccess,
    onError,
    readyToRun,
    runOnMount,
  ]);

  const loadWithUrl = useCallback(
    (url: string) => {
      api<DefaultResponse<D>>(url, {
        method,
        data: {
          ...body,
          bot_id: bot?.id,
        },
        headers,
        cache: bustCache ? false : undefined,
      })
        .then((res) => {
          onSuccess && onSuccess(res.data.data as D);
          setData(res.data.data);
          setSuccess(true);
          return res.data;
        })
        .catch((err) => {
          onError && onError(err);
          setData(undefined);
          setSuccess(false);
          return {
            error: err,
            success: false,
            data: null,
          } as DefaultResponse<null>;
        });
    },
    [load]
  );

  return {
    loading,
    data,
    load,
    success,
    loadWithUrl,
  };
}

export default useFetch;
