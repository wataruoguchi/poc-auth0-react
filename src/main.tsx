import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { setupWorker } from "msw/browser";
import { handlers } from "./mocks/handlers";

import App from "./App";

const worker = setupWorker(...handlers);
worker.start().then(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Failed to find the root element");
  }

  const root = createRoot(rootElement);
  root.render(
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage" // Note: This is not the safest option.
    >
      <App />
    </Auth0Provider>,
  );
});
