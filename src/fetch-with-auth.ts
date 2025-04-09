export function createFetchWithAuth(
  getAccessTokenSilently: () => Promise<string>
) {
  return async function fetchWithAuth(url: string, options: RequestInit) {
    const token = await getAccessTokenSilently();
    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  };
}
