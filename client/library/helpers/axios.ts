import axios, { AxiosError } from "axios";
import { refreshAccessToken } from "./fetching";
import { showNotification } from "@mantine/notifications";
import { logout } from "./auth";
import { setupCache } from "axios-cache-interceptor";

export const api = setupCache(
  axios.create({
    baseURL: "/",
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
      try {
        // Attempt to refresh the access token
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // Retry the original request with the new access token
          showNotification({
            title: "Error handled",
            message: "An error occurred, but it was handled",
          });
          if (error.config?.headers) {
            error.config.headers["x-access-token"] = newAccessToken;
            return axios.request(error.config);
          }
          return Promise.reject(error);
        } else {
          // Clear the user's session and redirect to the login page
          logout();
        }
      } catch (refreshError) {
        // Refresh token failed, clear the user's session and redirect to the login page
        console.error(refreshError);
        logout();
      }
    }
    // Pass the error along to the caller
    return Promise.reject(error);
  }
);
