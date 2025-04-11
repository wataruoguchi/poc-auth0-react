import type { Auth0ContextInterface } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./use-fetch";

// Create a complete mock of the Auth0 context
const createMockAuth0Context = (
  overrides: Partial<Auth0ContextInterface> = {},
): Auth0ContextInterface => ({
  getAccessTokenSilently: vi.fn().mockResolvedValue("test-token"),
  getAccessTokenWithPopup: vi.fn(),
  getIdTokenClaims: vi.fn(),
  loginWithRedirect: vi.fn(),
  loginWithPopup: vi.fn(),
  logout: vi.fn(),
  handleRedirectCallback: vi.fn(),
  isLoading: false,
  isAuthenticated: true,
  user: undefined,
  error: undefined,
  ...overrides,
});

// Mock the Auth0 hook
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useFetch", () => {
  const mockResponse = { data: "test" };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    // Set up default mock for fetch
    mockFetch.mockReset();
    // Set up default mock for Auth0
    vi.mocked(useAuth0).mockReturnValue(createMockAuth0Context());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchWithAuth", () => {
    it("should add auth header when skipAuth is false", async () => {
      mockFetch.mockResolvedValue(new Response());

      const { result } = renderHook(() => useFetch());
      const { fetchWithAuth } = result.current;

      await fetchWithAuth("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });

    it("should not add auth header when skipAuth is true", async () => {
      mockFetch.mockResolvedValue(new Response());

      const { result } = renderHook(() => useFetch());
      const { fetchWithAuth } = result.current;

      await fetchWithAuth("https://api.example.com", { skipAuth: true });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com",
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      );
    });

    it("should throw error when token fetch fails", async () => {
      // Create a new mock context specifically for this test
      const errorContext = createMockAuth0Context({
        getAccessTokenSilently: vi
          .fn()
          .mockRejectedValue(new Error("Token error")),
      });

      // Use mockReturnValue instead of mockReturnValueOnce to ensure the mock persists
      vi.mocked(useAuth0).mockReturnValue(errorContext);

      const { result } = renderHook(() => useFetch());
      const { fetchWithAuth } = result.current;

      await expect(fetchWithAuth("https://api.example.com")).rejects.toThrow(
        "Token error",
      );
    });
  });

  describe("useFetchData", () => {
    it("should handle successful fetch", async () => {
      // Reset mocks specifically for this test
      mockFetch.mockReset();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

      // Ensure we have a fresh Auth0 context for this test
      vi.mocked(useAuth0).mockReturnValue(createMockAuth0Context());

      const { result } = renderHook(() => {
        const { useFetchData } = useFetch();
        return useFetchData<typeof mockResponse>("https://api.example.com");
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockResponse);
    });

    it("should handle fetch error", async () => {
      // Reset mocks specifically for this test
      mockFetch.mockReset();
      const errorMessage = "Network error";
      mockFetch.mockRejectedValue(new Error(errorMessage));

      // Ensure we have a fresh Auth0 context for this test
      vi.mocked(useAuth0).mockReturnValue(createMockAuth0Context());

      const { result } = renderHook(() => {
        const { useFetchData } = useFetch();
        return useFetchData("https://api.example.com");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.data).toBeNull();
    });

    it("should handle non-200 response", async () => {
      // Reset mocks specifically for this test
      mockFetch.mockReset();
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ error: "Not found" }), { status: 404 }),
      );

      // Ensure we have a fresh Auth0 context for this test
      vi.mocked(useAuth0).mockReturnValue(createMockAuth0Context());

      const { result } = renderHook(() => {
        const { useFetchData } = useFetch();
        return useFetchData("https://api.example.com");
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain("404");
      expect(result.current.data).toBeNull();
    });
  });
});
