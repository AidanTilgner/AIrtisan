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

export const useCheckIsInOrganization = (
  {
    organization_id,
    admin_id,
  }: { organization_id: number | string; admin_id: number | string },
  config?: Partial<UseFetchConfig<unknown, boolean>>
) => {
  const { load, data, success } = useFetch<unknown, boolean>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}/is_member/${admin_id}`,
    method: "GET",
  });

  return {
    checkIsInOrganization: load,
    data: data,
    success,
  };
};

export const useCheckIsOwnerOfOrganization = (
  {
    organization_id,
    admin_id,
  }: { organization_id: number | string; admin_id: number | string },
  config?: Partial<UseFetchConfig<unknown, boolean>>
) => {
  const { load, data, success } = useFetch<unknown, boolean>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}/is_owner/${admin_id}`,
    method: "GET",
  });

  return {
    checkIsOwnerOfOrganization: load,
    data: data,
    success,
  };
};

export const useUpdateOrganization = (
  organization_id: number | string,
  update: Partial<Organization>,
  config?: Partial<UseFetchConfig<Partial<Organization>, Organization>>
) => {
  const { load, data, success } = useFetch<Partial<Organization>, Organization>(
    {
      useBotId: false,
      ...config,
      url: `/organizations/${organization_id}`,
      method: "PUT",
      body: {
        ...update,
      },
    }
  );

  return {
    updateOrganization: load,
    data: data,
    success,
  };
};

export const useDeleteOrganization = (
  organization_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Organization>>
) => {
  const { load, data, success } = useFetch<unknown, Organization>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}`,
    method: "DELETE",
  });

  return {
    deleteOrganization: load,
    data: data,
    success,
  };
};

export const useCreateOrganizationInvitation = (
  {
    organization_id,
    admin_id,
  }: { organization_id: number | string; admin_id: number | string },
  config?: Partial<UseFetchConfig<{ admin_id: number }, Organization>>
) => {
  const { load, data, success } = useFetch<{ admin_id: number }, Organization>({
    useBotId: false,
    ...config,
    url: `/organizations/${organization_id}/invite`,
    method: "POST",
    body: {
      admin_id: Number(admin_id),
    },
  });

  return {
    createOrganizationInvitation: load,
    data: data,
    success,
  };
};
