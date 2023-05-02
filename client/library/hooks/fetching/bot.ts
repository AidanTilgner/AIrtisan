import { Bot, ApiKey } from "../../../documentation/main";
import useFetch, { UseFetchConfig } from "../useFetch";

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
