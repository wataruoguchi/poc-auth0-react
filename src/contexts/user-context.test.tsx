import { render, screen, waitFor } from "@testing-library/react";
import {
  describe,
  expect,
  it,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import { UserProvider } from "./user-provider";
import { useUser } from "./user-context";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock useAuth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue("mock-token"),
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Setup MSW server
const server = setupServer();

// Test component that uses the context
function TestComponent() {
  const { applicationUser } = useUser();
  return (
    <div data-testid="user-data">
      {applicationUser?.firstName} {applicationUser?.lastName}
    </div>
  );
}

describe("UserContext", () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });
  afterAll(() => server.close());

  it("should provide user data to children", async () => {
    const name = "John Maverick";
    server.use(
      http.get("https://api.example.com/user", () => {
        return HttpResponse.json({
          id: "123",
          name,
          email: "john@example.com",
          firstName: "John",
          lastName: "Maverick",
        });
      }),
    );

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </QueryClientProvider>,
    );

    // Loading
    expect(screen.getByText("Loading user data...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("user-data")).toHaveTextContent(name);
    });

    unmount();
  });

  it("should show error state when API fails", async () => {
    // Override the handler to return an error
    server.use(
      http.get("https://api.example.com/user", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <TestComponent />
        </UserProvider>
      </QueryClientProvider>,
    );

    // First, we should see the loading state
    expect(screen.getByText("Loading user data...")).toBeInTheDocument();

    // Then, we should see the error state
    await waitFor(() => {
      expect(screen.getByTestId("user-provider-error")).toBeInTheDocument();
    });

    unmount();
  });

  it("should throw error when used outside provider", () => {
    // Suppress console error for this test
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useUser must be used within a UserProvider");

    console.error = consoleError;
  });
});
