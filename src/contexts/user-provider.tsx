/**
 * User context that combines Auth0 user data with application-specific user data.
 * This context automatically fetches application user data.
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * function App() {
 *   return (
 *     <UserProvider>
 *       <YourApp />
 *     </UserProvider>
 *   );
 * }
 *
 * // Use the context in any component
 * function UserProfile() {
 *   const { applicationUser } = useUser();
 *
 *   if (!applicationUser) return <div>No user data available</div>;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {applicationUser.name}</h1>
 *       <p>Email: {applicationUser.email}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useState } from "react";
import { UserContext } from "./user-context";
import { z } from "zod";
import { useAuthQuery } from "../hooks/use-auth-query";

export const ApplicationUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
// NOTE: It does not depend on Auth0.
export type ApplicationUser = z.infer<typeof ApplicationUserSchema>;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [applicationUser, setApplicationUser] =
    useState<ApplicationUser | null>(null);

  const { data, isLoading, error } = useAuthQuery(
    ["authUser"],
    "https://api.example.com/user",
    ApplicationUserSchema,
  );

  useEffect(() => {
    if (data) {
      setApplicationUser(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div>
        <div>Loading user data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div data-testid="user-provider-error">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        applicationUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
