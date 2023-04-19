import { api } from "../axios";
import { showNotification } from "@mantine/notifications";
import { Admin, ApiKey } from "../../../documentation/main";

export const getAdmins = async () => {
  return await api
    .get("/auth/admins")
    .then((res) => {
      return {
        admins: res.data.data.admins as Admin[],
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return {
        error: err,
      };
    });
};

export const addAdmin = async ({ username }: { username: string }) => {
  return await api
    .post("/auth/admin/register", {
      username,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Admin added",
      });
      return {
        username: res.data.data.username,
        password: res.data.data.password,
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return {
        error: err,
      };
    });
};

export const deleteAdmin = async ({ id }: { id: number }) => {
  return await api
    .delete(`/auth/admin/${id}`)
    .then((res) => {
      return {
        deleted: res.data.data.success,
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const getAdmin = async ({ id }: { id: number }) => {
  return await api
    .get(`/auth/admin/${id}`)
    .then((res) => {
      return {
        admin: res.data.data.admin as Admin,
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const addApiKey = async ({ name }: { name: string }) => {
  return await api
    .post("/auth/api-key/register", {
      name,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "API Key added",
      });
      return {
        api_key: res.data.data.apiKey as ApiKey & { key: string },
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const deleteApiKey = async ({ id }: { id: number }) => {
  return await api
    .delete(`/auth/api-key/${id}`)
    .then((res) => {
      return {
        deleted: res.data.data.success,
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const getAllApiKeys = async () => {
  return await api
    .get("/auth/api-keys")
    .then((res) => {
      return {
        api_keys: res.data.data.apiKeys as unknown as ApiKey[],
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const logoutAdmin = async ({ id }: { id: number }) => {
  return await api
    .post(`/auth/admin/${id}/logout`)
    .then((res) => {
      return {
        logged_out: !!res.data.data.success,
      };
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};
