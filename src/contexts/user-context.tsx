import { createContext, useContext } from "react";

// NOTE: It does not depend on Auth0.
export type ApplicationUser = {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type UserContextType = {
  applicationUser: ApplicationUser | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
