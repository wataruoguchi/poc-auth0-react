/**
 * A custom hook that provides authenticated fetch functionality using Auth0.
 *
 * @example
 * ```tsx
 * // Basic usage with useFetchData
 * function MyComponent() {
 *   const { useFetchData } = useFetch();
 *   const { data, isLoading, error } = useFetchData<User>('/api/user');
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   return <div>Hello, {data?.name}!</div>;
 * }
 *
 * // Using fetchWithAuth directly
 * function MyComponent() {
 *   const { fetchWithAuth } = useFetch();
 *
 *   const handleClick = async () => {
 *     try {
 *       const response = await fetchWithAuth('/api/data');
 *       const data = await response.json();
 *       // Handle data
 *     } catch (error) {
 *       // Handle error
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Fetch Data</button>;
 * }
 *
 * // Skip authentication for public endpoints
 * function MyComponent() {
 *   const { useFetchData } = useFetch();
 *   const { data } = useFetchData<PublicData>('/api/public', { skipAuth: true });
 *   // ...
 * }
 * ```
 *
 * @returns An object containing:
 *   - `fetchWithAuth`: A function to make authenticated fetch requests
 *   - `useFetchData`: A hook that handles data fetching with loading and error states
 */
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

export function useFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    const { skipAuth, ...fetchOptions } = options;

    if (skipAuth) {
      return fetch(url, fetchOptions);
    }

    try {
      const token = await getAccessTokenSilently();
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
}
