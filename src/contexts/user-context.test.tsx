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
import { handlers } from "../mocks/handlers";
import { http, HttpResponse } from "msw";

// Mock useAuth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    getAccessTokenSilently: vi.fn().mockResolvedValue("mock-token"),
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Setup MSW server
const server = setupServer(...handlers);

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
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should provide user data to children", async () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-data")).toHaveTextContent(
        "John Maverick",
      );
    });
  });

  it("should show loading state initially", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    expect(screen.getByText("Loading user data...")).toBeInTheDocument();
  });

  it("should show error state when API fails", async () => {
    // Override the handler to return an error
    server.use(
      http.get("https://api.example.com/user", () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Error: HTTP error! status: 500"),
      ).toBeInTheDocument();
    });
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
