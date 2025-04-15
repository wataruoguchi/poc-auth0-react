import { useUser } from "./contexts/user-context";

export function UserProfileDetails() {
  const { applicationUser } = useUser();

  if (!applicationUser) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p>
        Name: {applicationUser.firstName} {applicationUser.lastName}
      </p>
    </div>
  );
}
