import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect } from "react";
import { LogoutButton } from "./LogoutButton";
import { LoginButton } from "./LoginButton";
import { logoutParams } from "./logout-params";
import { UserProfile } from "./UserProfile";
function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  // These function is a dependency of the useEffect below, so we need to memoize it.
  const auth0Logout = useCallback(() => {
    logout(logoutParams);
  }, [logout]);

  // Set up a listener for token expiration
  useEffect(() => {
    const checkTokenExpiration = async () => {
      try {
        await getAccessTokenSilently();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        auth0Logout();
      }
    };

    // Check token every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [getAccessTokenSilently, auth0Logout]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div>
        Hello {user.name} <LogoutButton />
        <UserProfile />
      </div>
    );
  }
  return <LoginButton />;
}

export default App;
