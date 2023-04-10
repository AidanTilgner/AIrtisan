import React, { createContext, useContext, useEffect, useState } from "react";
import {
  checkIsSuperAdmin,
  checkAuth,
  getMe,
  refreshAccessToken,
} from "../helpers/fetching";
import { Admin } from "../../documentation/main";
import { logout } from "../helpers/auth";

interface UserContextType {
  user: Admin | null;
  setUser: React.Dispatch<React.SetStateAction<Admin | null>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isSuperAdmin: boolean;
  setIsSuperAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialVal: UserContextType = {
  user: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUser: () => {},
  isLoggedIn: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIsLoggedIn: () => {},
  isSuperAdmin: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIsSuperAdmin: () => {},
};

const UserContext = createContext(initialVal);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const tryRefresh = async () => {
    try {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const authed = await checkAuth();
      if (authed) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        const refreshed = await tryRefresh();
        if (refreshed) {
          setIsLoggedIn(true);
          return;
        }
        logout();
      }
      const user = await getMe();
      setUser(user);
      const isSuperAdmin = await checkIsSuperAdmin();
      setIsSuperAdmin(isSuperAdmin);
    })();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        isSuperAdmin,
        setIsSuperAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);

export { UserContext, UserProvider, useUser };
