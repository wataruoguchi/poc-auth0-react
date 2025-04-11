import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAuthTokenProvider,
  createFetchClient,
  createUseFetch,
} from "./use-fetch";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useFetch", () => {
  const mockToken = "test-token";
  const mockResponse = { data: "test" };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchWithAuth", () => {
    it("should add auth header when skipAuth is false", async () => {
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const authTokenProvider = createAuthTokenProvider(mockGetToken);
      const fetchClient = createFetchClient(authTokenProvider);
      const { fetchWithAuth } = createUseFetch(fetchClient);

      mockFetch.mockResolvedValue(new Response());

      await fetchWithAuth("https://api.example.com");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
    });

    it("should not add auth header when skipAuth is true", async () => {
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const authTokenProvider = createAuthTokenProvider(mockGetToken);
      const fetchClient = createFetchClient(authTokenProvider);
      const { fetchWithAuth } = createUseFetch(fetchClient);

      mockFetch.mockResolvedValue(new Response());

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
      const mockGetToken = vi.fn().mockRejectedValue(new Error("Token error"));
      const authTokenProvider = createAuthTokenProvider(mockGetToken);
      const fetchClient = createFetchClient(authTokenProvider);
      const { fetchWithAuth } = createUseFetch(fetchClient);

      await expect(fetchWithAuth("https://api.example.com")).rejects.toThrow(
        "Token error",
      );
    });
  });

  describe("useFetchData", () => {
    it("should handle successful fetch", async () => {
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const authTokenProvider = createAuthTokenProvider(mockGetToken);
      const fetchClient = createFetchClient(authTokenProvider);
      const { useFetchData } = createUseFetch(fetchClient);

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify(mockResponse), { status: 200 }),
      );

      const { result } = renderHook(() =>
        useFetchData<typeof mockResponse>("https://api.example.com"),
      );

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
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const authTokenProvider = createAuthTokenProvider(mockGetToken);
      const fetchClient = createFetchClient(authTokenProvider);
      const { useFetchData } = createUseFetch(fetchClient);

      const errorMessage = "Network error";
      mockFetch.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useFetchData("https://api.example.com"),
      );

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
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const authTokenProvider = createAuthTokenProvider(mockGetToken);
      const fetchClient = createFetchClient(authTokenProvider);
      const { useFetchData } = createUseFetch(fetchClient);

      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ error: "Not found" }), { status: 404 }),
      );

      const { result } = renderHook(() =>
        useFetchData("https://api.example.com"),
      );

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
