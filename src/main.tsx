import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

import App from "./App";

mockApisIfDevelopment().then(() => {
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

async function mockApisIfDevelopment() {
  const isDevelopment = import.meta.env.MODE === "development";
  if (isDevelopment) {
    const { setupWorker } = await import("msw/browser");
    const { handlers } = await import("./mocks/handlers");
    const worker = setupWorker(...handlers);
    return worker.start();
  }
  return Promise.resolve();
}
