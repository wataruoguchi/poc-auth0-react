import { createContext, useContext } from "react";
import type { ApplicationUser } from "./user-provider";

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
