import { ReactNode, createContext, useMemo, useState } from "react";

interface Props {
  children?: ReactNode | ReactNode[];
}

export const UserContext = createContext({
  email: null,
  firstName: null,
  lastName: null,
  isLoggedIn: false,
  isAdmin: false,
  assignedFiles: null,
  setFirstName: (name: string) => {},
  setLastName: (name: string) => {},
  setEmail: (email: string) => {},
  setIsAdmin: (isAdmin: boolean) => {},
  setIsLoggedIn: (loggedIn: boolean) => {},
  setAssignedFiles: (assignedFiles: string[]) => {},
});

export const UserContextProvider = ({ children }: Props) => {
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [assignedFiles, setAssignedFiles] = useState(false);

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
      assignedFiles,
      setAssignedFiles,
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
    assignedFiles,
    setAssignedFiles,
  ]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
