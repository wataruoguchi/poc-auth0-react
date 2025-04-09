import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect } from "react";
import { createFetchWithAuth } from "./fetch-with-auth";

function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  // These function is a dependency of the useEffect below, so we need to memoize it.
  const auth0Logout = useCallback(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchWithAuth = createFetchWithAuth(getAccessTokenSilently);

  /**
   * Usage of the fetchWithAuth function
   *
   * fetchWithAuth("http://localhost:3000/api/something", {
   *   method: "GET",
   * })
   *   .then((res) => res.json())
   *   .then((data) => {
   *     console.log({ data });
   *   });
   */

  /**
   * Then, Child components would use the following functions:
   * - fetchWithAuth
   * - auth0Logout
   * - loginWithRedirect
   * - user
   */

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div>
        Hello {user.name}{" "}
        <button type="button" onClick={auth0Logout}>
          Log out
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={() => loginWithRedirect()}>
      Log in
    </button>
  );
}

export default App;
