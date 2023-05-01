import useFetch, { UseFetchConfig } from "../useFetch";
import { Admin, Bot, Organization } from "../../../documentation/main";

export const useGetMe = (
  config?: Partial<UseFetchConfig<unknown, Omit<Admin, "password">>>
) => {
  const { load, data, success } = useFetch<unknown, Omit<Admin, "password">>({
    useBotId: false,
    ...config,
    url: "/auth/me",
    method: "GET",
  });

  return {
    getMe: load,
    data: data,
    success,
  };
};

export const useGetMyOrganizations = (
  config?: Partial<UseFetchConfig<unknown, Organization[]>>
) => {
  const { load, data, success } = useFetch<unknown, Organization[]>({
    useBotId: false,
    ...config,
    url: "/auth/me/organizations",
    method: "GET",
  });

  return {
    getMyOrganizations: load,
    data: data,
    success,
  };
};

export const useGetMyBots = (
  config?: Partial<UseFetchConfig<unknown, Bot[]>>
) => {
  const { load, data, success } = useFetch<unknown, Bot[]>({
    useBotId: false,
    ...config,
    url: "/auth/me/bots",
    method: "GET",
  });

  return {
    getMyBots: load,
    data: data,
    success,
  };
};

export const useUpdateMe = (
  update: Partial<Admin>,
  config?: Partial<UseFetchConfig<Admin, Admin>>
) => {
  const { load, data, success } = useFetch<Partial<Admin>, Admin>({
    useBotId: false,
    ...config,
    url: `/auth/me`,
    method: "PUT",
    body: update,
  });

  return {
    updateMe: load,
    data: data,
    success,
  };
};

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

export const getAdminByUsername = (
  username: string,
  config?: Partial<UseFetchConfig<undefined, Admin>>
) => {
  const { data, load, loading } = useFetch<undefined, Admin>({
    useBotId: false,
    ...config,
    url: `/admin/by_name/${username}`,
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

export const useGetAdminByUsername = (
  username: string,
  config?: Partial<UseFetchConfig<undefined, Admin>>
) => {
  const { data, load, loading } = useFetch<undefined, Admin>({
    useBotId: false,
    ...config,
    url: `/admin/by_name/${username}`,
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
    getAdminBots: load,
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

export const useSearchAdmins = (
  query: string,
  config?: Partial<UseFetchConfig<undefined, Admin[]>>
) => {
  const { data, load, loading } = useFetch<undefined, Admin[]>({
    useBotId: false,
    ...config,
    url: `/admin/search?query=${query}`,
    method: "GET",
  });

  return {
    searchAdmins: () => {
      load();
    },
    data: data,
    loading: loading,
  };
};
