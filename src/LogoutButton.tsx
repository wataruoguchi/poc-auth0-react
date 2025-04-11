import { useAuth0 } from "@auth0/auth0-react";
import { logoutParams } from "./logout-params";

export const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button type="button" onClick={() => logout(logoutParams)}>
      Log Out
    </button>
  );
};
