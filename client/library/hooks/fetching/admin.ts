import useFetch, { UseFetchConfig } from "../useFetch";
import { Admin, Bot, Organization } from "../../../documentation/main";

export const useGetAdmin = (
  admin_id: string | number,
  config?: Partial<UseFetchConfig<undefined, Admin>>
) => {
  const { data, load, loading } = useFetch<undefined, Admin>({
    useBotId: false,
    ...config,
    url: `/admin/${admin_id}`,
    method: "GET",
  });

  return {
    getAdmin: () => {
      load();
    },
    data: data,
    loading: loading,
  };
};

export const useGetAdminBots = (
  admin_id: string | number,
  config?: Partial<UseFetchConfig<unknown, Bot[]>>
) => {
  const { load, data, success } = useFetch<unknown, Bot[]>({
    useBotId: false,
    ...config,
    url: `/admin/${admin_id}/bots`,
    method: "GET",
  });

  return {
    getMyBots: load,
    data: data,
    success,
  };
};

export const useGetAdminOrganizations = (
  admin_id: string | number,
  config?: Partial<UseFetchConfig<unknown, Organization[]>>
) => {
  const { load, data, success } = useFetch<unknown, Organization[]>({
    useBotId: false,
    ...config,
    url: `/admin/${admin_id}/organizations`,
    method: "GET",
  });

  return {
    getMyOrganizations: load,
    data: data,
    success,
  };
};
