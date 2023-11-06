import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const UserContext = createContext({
  name: null,
  email: null,
  isLoggedIn: false,
  setName: (name: string) => {},
  setEmail: (email: string) => {},
  setIsLoggedIn: (loggedIn: boolean) => {},
});

export const UserContextProvider = ({ children }: Props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const value = useMemo(() => {
    return {
      name,
      email,
      isLoggedIn,
      setEmail,
      setName,
      setIsLoggedIn,
    };
  }, [name, email, isLoggedIn, setEmail, setName, setIsLoggedIn]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
