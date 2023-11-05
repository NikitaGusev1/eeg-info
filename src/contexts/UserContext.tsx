import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const UserContext = createContext({
  name: null,
  email: null,
  setName: (name: string) => {},
  setEmail: (email: string) => {},
});

export const UserContextProvider = ({ children }: Props) => {
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);

  const value = useMemo(() => {
    return {
      name,
      email,
      setEmail,
      setName,
    };
  }, [name, email, setEmail, setName]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
