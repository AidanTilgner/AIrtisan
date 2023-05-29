import { Bot, ApiKey } from "../../../documentation/main";
import useFetch, { UseFetchConfig } from "../useFetch";

export const useGetBot = (
  botId: number | string,
  config?: Partial<UseFetchConfig<undefined, Bot>>
) => {
  const { load, data, success } = useFetch<undefined, Bot>({
    useBotId: false,
    ...config,
    url: `/bots/${botId}`,
    method: "GET",
  });

  return {
    getBot: load,
    data: data,
    success,
  };
};

export const useAddApiKey = (
  name: string,
  config?: Partial<UseFetchConfig<{ name: string }, ApiKey>>
) => {
  const { load, data, success } = useFetch<{ name: string }, ApiKey>({
    ...config,
    url: `/auth/api-key/register`,
    method: "POST",
    body: {
      name,
    },
  });

  return {
    addApiKey: load,
    data: data,
    success,
  };
};

export const useCreateBot = (
  {
    name,
    description,
    bot_version,
    owner_id,
    owner_type,
    bot_language,
  } = {} as Partial<Bot>,
  config?: Partial<UseFetchConfig<Partial<Bot>, Bot>>
) => {
  const { load, data, success } = useFetch<Partial<Bot>, Bot>({
    useBotId: false,
    ...config,
    url: `/bots`,
    method: "POST",
    body: {
      name,
      description,
      bot_version,
      owner_id,
      owner_type,
      bot_language,
    },
  });

  return {
    createBot: load,
    data: data,
    success,
  };
};

export const useGetBotIsRunning = (
  botId: number | string,
  config?: Partial<UseFetchConfig<undefined, boolean>>
) => {
  const { load, data, success } = useFetch<undefined, boolean>({
    useBotId: false,
    ...config,
    url: `/bots/${botId}/running`,
    method: "GET",
  });

  return {
    getBotIsRunning: load,
    data: data,
    success,
  };
};

export const useStartupBot = (
  botId: number | string,
  config?: Partial<UseFetchConfig<undefined, boolean>>
) => {
  const { load, data, success } = useFetch<undefined, boolean>({
    useBotId: false,
    ...config,
    url: `/bots/${botId}/startup`,
    method: "POST",
  });

  return {
    startupBot: load,
    data: data,
    success,
  };
};

export const usePauseBot = (
  botId: number,
  config?: Partial<UseFetchConfig<undefined, boolean>>
) => {
  const { load, data, success } = useFetch<undefined, boolean>({
    useBotId: false,
    ...config,
    url: `/bots/${botId}/pause`,
    method: "POST",
  });

  return {
    pauseBot: load,
    data: data,
    success,
  };
};

export const useGetMyRecentBots = (
  config?: Partial<UseFetchConfig<undefined, Bot[]>>
) => {
  const { load, data, success } = useFetch<undefined, Bot[]>({
    useBotId: false,
    ...config,
    url: `/auth/me/bots/recent`,
    method: "GET",
  });

  return {
    getMyRecentBots: load,
    data: data,
    success,
  };
};

export const useGetApiKeys = (
  config?: Partial<UseFetchConfig<undefined, ApiKey[]>>
) => {
  const { load, data, success } = useFetch<undefined, ApiKey[]>({
    ...config,
    url: `/auth/api-keys`,
    method: "GET",
  });

  return {
    getApiKeys: load,
    data: data,
    success,
  };
};

export const useDeleteApiKey = (
  config?: Partial<UseFetchConfig<undefined, boolean>>
) => {
  const { load, data, success } = useFetch<undefined, boolean>({
    ...config,
    url: `/auth/api-key`,
    method: "DELETE",
  });

  return {
    deleteApiKey: load,
    data: data,
    success,
  };
};

export const useDeleteBot = (
  botId: number | string,
  config?: Partial<UseFetchConfig<undefined, boolean>>
) => {
  const { load, data, success } = useFetch<undefined, boolean>({
    useBotId: false,
    ...config,
    url: `/bots/${botId}`,
    method: "DELETE",
  });

  return {
    deleteBot: load,
    data: data,
    success,
  };
};

export const useGetAllBots = (
  config?: Partial<UseFetchConfig<undefined, Bot[]>>
) => {
  const { load, data, success } = useFetch<undefined, Bot[]>({
    useBotId: false,
    ...config,
    url: `/bots/as_admin/all`,
    method: "GET",
  });

  return {
    getAllBots: load,
    data: data,
    success,
  };
};
