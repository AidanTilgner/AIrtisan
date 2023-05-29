import React, { createContext, useContext, useMemo } from "react";
import { Admin } from "../../documentation/main";
import { useRefreshAccessToken } from "../hooks/fetching/common";
import { useGetMe } from "../hooks/fetching/admin";
import { useEffect } from "react";

interface UserContextType {
  user: Admin | null;
  isSuperAdmin: boolean;
  loading: boolean;
  reload: () => void;
}

const initialVal: UserContextType = {
  user: null,
  isSuperAdmin: false,
  loading: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reload: () => {},
};

const UserContext = createContext(initialVal);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: user = null,
    loading,
    getMe: reload,
  } = useGetMe({ runOnMount: true });

  const { refreshAccessToken } = useRefreshAccessToken();

  useEffect(() => {
    refreshAccessToken();
  }, []);

  const value: UserContextType = useMemo(
    () => ({
      user,
      isSuperAdmin: user?.role === "superadmin",
      loading,
      reload,
    }),
    [user, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUser = () => useContext(UserContext);

export { UserContext, UserProvider, useUser };
