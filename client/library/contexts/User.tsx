import React, { createContext, useContext, useEffect, useState } from "react";
import { checkIsSuperAdmin, checkAuth, getMe } from "../helpers/fetching";
import { Admin } from "../../documentation/main";

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
  setUser: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  isSuperAdmin: false,
  setIsSuperAdmin: () => {},
};

const UserContext = createContext(initialVal);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const authed = await checkAuth();
      if (authed) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        const currentUrl = window.location.href;
        window.location.href = "/login?redirectUrl=" + currentUrl;
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
