export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  const currentUrl = window.location.href;
  window.location.href = "/login?redirectUrl=" + currentUrl;
};
