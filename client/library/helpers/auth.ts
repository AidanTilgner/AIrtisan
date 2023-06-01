import { logoutAdmin } from "./fetching/admin";
import jwtDecode from "jwt-decode";

export const logout = async (reason?: string) => {
  try {
    const decodedToken = jwtDecode(localStorage.getItem("accessToken") || "");

    const id = (decodedToken as { id: string | number }).id;

    const currentUrl = window.location.href;
    const reasonQuery = reason ? `&reason=${reason}` : "";

    if (!id) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      window.location.href = "/login?redirectUrl=" + currentUrl + reasonQuery;
      return;
    }

    await logoutAdmin({ id: Number(id) });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.location.href = "/login?redirectUrl=" + currentUrl + reasonQuery;
  } catch (err) {
    console.error(err);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    const currentUrl = window.location.href;
    window.location.href = "/login?redirectUrl=" + currentUrl;
  }
};
