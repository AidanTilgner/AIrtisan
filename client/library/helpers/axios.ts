import axios, { AxiosError } from "axios";
import { logout } from "./auth";
import { setupCache } from "axios-cache-interceptor";

export const api = setupCache(
  axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
      "x-access-token": localStorage.getItem("accessToken"),
    },
  }),
  {
    ttl: 2 * 1000,
    interpretHeader: false,
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Check for 401 Unauthorized error
    if (error.response?.status === 401) {
      logout("unauthorized");
    }
    // Pass the error along to the caller
    return Promise.reject(error);
  }
);
