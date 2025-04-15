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
import { useFetch } from "../hooks/use-fetch";
import { UserContext, type ApplicationUser } from "./user-context";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { useFetchData } = useFetch();
  const [applicationUser, setApplicationUser] =
    useState<ApplicationUser | null>(null);

  const { data, isLoading, error } = useFetchData<ApplicationUser>(
    "https://api.example.com/user",
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
        <div>Error: {error.message}</div>
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
