import { http, HttpResponse } from "msw";
import type { ApplicationUser } from "../contexts/user-provider";
import { decodeJwt } from "./decode-jwt";

function getUser(email: string): ApplicationUser | null {
  return (
    [
      {
        id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b303b3d",
        name: "John Maverick",
        firstName: "John",
        lastName: "Maverick",
        email: "john.maverick@example.com",
      },
      {
        id: "c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b31",
        name: "Jane Doe",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com",
      },
    ].find((user) => user.email === email) ?? null
  );
}

const emailAttrNameInJwt = "email";

export const handlers = [
  http.get("https://api.example.com/user", ({ request }) => {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const decoded = token ? decodeJwt(token) : null;
    if (decoded) {
      const user = getUser(decoded[emailAttrNameInJwt]);
      return HttpResponse.json(user ?? { error: "Unauthorized" }, {
        status: 401,
      });
    }
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),
];
