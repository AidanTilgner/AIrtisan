import React, { createContext, useContext, useMemo } from "react";
import { Admin } from "../../documentation/main";
import { useGetMe, useRefreshAccessToken } from "../hooks/fetching/common";
import { useEffect } from "react";

interface UserContextType {
  user: Admin | null;
  isSuperAdmin: boolean;
}

const initialVal: UserContextType = {
  user: null,
  isSuperAdmin: false,
};

const UserContext = createContext(initialVal);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user = null } = useGetMe({ runOnMount: true });

  const { refreshAccessToken } = useRefreshAccessToken();

  useEffect(() => {
    refreshAccessToken();
  }, []);

  const value: UserContextType = useMemo(
    () => ({
      user,
      isSuperAdmin: user?.role === "superadmin",
    }),
    [user]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUser = () => useContext(UserContext);

export { UserContext, UserProvider, useUser };
