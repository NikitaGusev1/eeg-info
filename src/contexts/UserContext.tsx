import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const UserContext = createContext({
  name: null,
  email: null,
  isLoggedIn: false,
  isAdmin: false,
  setFirstName: (name: string) => {},
  setLastName: (name: string) => {},
  setEmail: (email: string) => {},
  setIsAdmin: (isAdmin: boolean) => {},
  setIsLoggedIn: (loggedIn: boolean) => {},
});

export const UserContextProvider = ({ children }: Props) => {
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = useMemo(() => {
    return {
      email,
      isLoggedIn,
      isAdmin,
      setEmail,
      setFirstName,
      setLastName,
      firstName,
      lastName,
      setIsAdmin,
      setIsLoggedIn,
    };
  }, [
    email,
    isLoggedIn,
    isAdmin,
    setEmail,
    firstName,
    lastName,
    setFirstName,
    setLastName,
    setIsLoggedIn,
    setIsAdmin,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
