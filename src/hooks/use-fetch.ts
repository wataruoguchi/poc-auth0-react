import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

type FetchOptions = Omit<RequestInit, "headers"> & {
  skipAuth?: boolean;
  headers?: HeadersInit;
};

type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

type FetchFunction = (url: string, options?: FetchOptions) => Promise<Response>;

// Separate auth token provider for better testability
export const createAuthTokenProvider = (getToken: () => Promise<string>) => ({
  getToken,
});

// Separate fetch client for better testability
export const createFetchClient = (
  authTokenProvider: ReturnType<typeof createAuthTokenProvider>,
) => {
  const fetchWithAuth: FetchFunction = async (
    url,
    options: FetchOptions = {},
  ) => {
    const { skipAuth, ...fetchOptions } = options;

    if (skipAuth) {
      return fetch(url, fetchOptions);
    }

    try {
      const token = await authTokenProvider.getToken();
      const headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (error) {
      console.error("Error getting access token:", error);
      throw error;
    }
  };

  return { fetchWithAuth };
};

// Hook factory for better testability
export const createUseFetch = (
  fetchClient: ReturnType<typeof createFetchClient>,
) => {
  const { fetchWithAuth } = fetchClient;

  const useFetchData = <T>(url: string, options?: FetchOptions) => {
    const [state, setState] = useState<FetchState<T>>({
      data: null,
      isLoading: false,
      error: null,
    });

    useEffect(() => {
      let isMounted = true;

      const fetchData = async () => {
        try {
          setState((prev) => ({ ...prev, isLoading: true, error: null }));
          const response = await fetchWithAuth(url, options);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (isMounted) {
            setState({ data, isLoading: false, error: null });
          }
        } catch (err) {
          if (isMounted) {
            setState({
              data: null,
              isLoading: false,
              error:
                err instanceof Error ? err : new Error("An error occurred"),
            });
          }
        }
      };

      fetchData();

      return () => {
        isMounted = false;
      };
    }, [url, options]);

    return state;
  };

  return {
    fetchWithAuth,
    useFetchData,
  };
};

// Production hook using Auth0
export const useFetch = () => {
  const { getAccessTokenSilently } = useAuth0();
  return createUseFetch(
    createFetchClient(createAuthTokenProvider(getAccessTokenSilently)),
  );
};
