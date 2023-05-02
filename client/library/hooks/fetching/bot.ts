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
