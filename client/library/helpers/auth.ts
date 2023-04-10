import { logoutAdmin } from "./fetching/admin";
import jwtDecode from "jwt-decode";

export const logout = async () => {
  try {
    const decodedToken = jwtDecode(localStorage.getItem("accessToken") || "");

    const id = (decodedToken as { id: string | number }).id;

    if (!id) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const currentUrl = window.location.href;
      window.location.href = "/login?redirectUrl=" + currentUrl;
      return;
    }

    await logoutAdmin({ id: Number(id) });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    const currentUrl = window.location.href;
    window.location.href = "/login?redirectUrl=" + currentUrl;
  } catch (err) {
    console.error(err);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    const currentUrl = window.location.href;
    window.location.href = "/login?redirectUrl=" + currentUrl;
  }
};
