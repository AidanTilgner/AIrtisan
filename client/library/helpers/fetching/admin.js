import { api } from ".";
import { showNotification } from "@mantine/notifications";

export const getAdmins = async () => {
  return await api
    .get("/auth/admins")
    .then((res) => {
      return {
        admins: res.data.data.admins,
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

export const addAdmin = async ({ username }) => {
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
      return err;
    });
};

export const deleteAdmin = async ({ id }) => {
  return await api
    .delete(`/auth/admin/${id}`)
    .then((res) => {
      return res.data.data;
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

export const getAdmin = async ({ id }) => {
  return await api
    .get(`/auth/admin/${id}`)
    .then((res) => {
      return res.data.data;
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

export const addApiKey = async ({ name }) => {
  return await api
    .post("/auth/api-key/register", {
      name,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "API Key added",
      });
      return res.data.data;
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

export const deleteApiKey = async ({ id }) => {
  return await api
    .delete(`/auth/api-key/${id}`)
    .then((res) => {
      return res.data.data;
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
      return res.data.data;
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
