import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const UserContext = createContext({
  name: null,
  email: null,
  isLoggedIn: false,
  isAdmin: false,
  setName: (name: string) => {},
  setEmail: (email: string) => {},
  setIsAdmin: (isAdmin: boolean) => {},
  setIsLoggedIn: (loggedIn: boolean) => {},
});

export const UserContextProvider = ({ children }: Props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = useMemo(() => {
    return {
      name,
      email,
      isLoggedIn,
      isAdmin,
      setEmail,
      setName,
      setIsAdmin,
      setIsLoggedIn,
    };
  }, [
    name,
    email,
    isLoggedIn,
    isAdmin,
    setEmail,
    setName,
    setIsLoggedIn,
    setIsAdmin,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
