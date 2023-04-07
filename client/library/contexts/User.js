import React, { createContext, useContext, useEffect, useState } from "react";
import { checkIsSuperAdmin, checkAuth } from "../helpers/fetching";

const initialVal = {
  user: null,
  setUser: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  isSuperAdmin: false,
};

const UserContext = createContext(initialVal);

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const authed = await checkAuth();
      if (authed) {
        setIsLoggedIn(true);
        setUser(authed);
      } else {
        setIsLoggedIn(false);
      }
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
