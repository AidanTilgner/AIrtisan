import { useCallback, useEffect, useState } from "react";
import { api } from "../helpers/axios";
import { DefaultResponse } from "../../documentation/server";
import { useParams } from "react-router-dom";

export interface UseFetchConfig<B, D> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: B;
  onBefore?: () => void;
  onSuccess?: (data: D) => void;
  onError?: (err: unknown) => void;
  onFinally?: () => void;
  headers?: Record<string, string> | undefined;
  query?: Record<string, string> | undefined;
  bustCache?: boolean;
  runOnMount?: boolean;
  useBotId?: boolean;
  dependencies?: unknown[];
  runOnDependencies?: unknown[];
}

function useFetch<B, D>({
  url,
  method = "GET",
  body,
  onBefore,
  onSuccess,
  onError,
  onFinally,
  headers,
  query,
  bustCache,
  runOnMount = false,
  useBotId = true,
  dependencies = [],
  runOnDependencies = [],
}: UseFetchConfig<B, D>) {
  const { bot_id = "" } = useParams();

  const allQuery: Record<string, string> = useBotId
    ? {
        ...query,
        bot_id,
      }
    : {
        ...query,
      };

  const readyToRun = () => {
    if (useBotId) {
      return !!bot_id;
    }
    return true;
  };

  const queryStr = Object.keys(allQuery)
    .map((key) => (allQuery[key] ? `${key}=${allQuery[key]}` : ""))
    .join("&");

  const urlToUse = queryStr ? `${url}?${queryStr}` : url;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<D>();
  const [success, setSuccess] = useState(false);

  const load = useCallback(
    async (loadConfig?: { updatedUrl?: string; updatedBody?: B }) => {
      if (!readyToRun()) return;
      onBefore && onBefore();
      setLoading(true);
      return api<DefaultResponse<D>>(loadConfig?.updatedUrl || urlToUse, {
        method,
        data: {
          ...(loadConfig?.updatedBody || body),
          bot_id,
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
          const message = err?.response?.data?.message || err?.message || null;
          return {
            error: err,
            success: false,
            data: null,
            message,
          } as DefaultResponse<null>;
        })
        .finally(() => {
          setLoading(false);
          onFinally && onFinally();
        });
    },
    [urlToUse, method, body, headers, bustCache, readyToRun, ...dependencies]
  );

  useEffect(() => {
    if (!readyToRun()) {
      return;
    }

    if (
      runOnMount ||
      (runOnDependencies.length > 0 && runOnDependencies.every((dep) => !!dep))
    ) {
      if (!readyToRun()) {
        console.error(
          "Tried to run on mount when wasn't ready to run",
          `${method} ${urlToUse}`
        );
        return;
      }
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
    readyToRun,
    runOnMount,
    ...runOnDependencies,
  ]);

  const loadWithUrl = useCallback(
    (url: string) => {
      api<DefaultResponse<D>>(url, {
        method,
        data: {
          ...body,
          bot_id,
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

  return { loading, data, load, success, loadWithUrl };
}

export default useFetch;
