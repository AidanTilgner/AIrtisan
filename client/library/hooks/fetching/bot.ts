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
