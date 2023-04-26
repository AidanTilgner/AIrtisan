import { Admin, Bot, Organization } from "../../../documentation/main";
import useFetch, { UseFetchConfig } from "../useFetch";

export const useGetOrganization = (
  organization_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Organization>>
) => {
  const { load, data, success } = useFetch<unknown, Organization>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}`,
    method: "GET",
  });

  return {
    getOrganization: load,
    data: data,
    success,
  };
};

export const useGetOrganizationBots = (
  organization_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Bot[]>>
) => {
  const { load, data, success } = useFetch<unknown, Bot[]>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}/bots`,
    method: "GET",
  });

  return {
    getOrganizationBots: load,
    data: data,
    success,
  };
};

export const useGetOrganizationAdmins = (
  organization_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Admin[]>>
) => {
  const { load, data, success } = useFetch<unknown, Admin[]>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}/admins`,
    method: "GET",
  });

  return {
    getOrganizationAdmins: load,
    data: data,
    success,
  };
};
