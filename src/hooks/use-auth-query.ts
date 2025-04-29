import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { ZodSchema } from "zod";
import { fetchWithAuth } from "../lib/fetch-with-auth";

export function useAuthQuery<T>(
  key: string[],
  url: string,
  schema: ZodSchema<T>,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">,
) {
  const { getAccessTokenSilently } = useAuth0();

  return useQuery<T, Error>({
    queryKey: key,
    queryFn: () => fetchWithAuth(getAccessTokenSilently, url, schema),
    ...options,
  });
}
