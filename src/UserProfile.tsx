import { UserProfileDetails } from "./UserProfileDetails";

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  token: string;
};

export function UserProfile() {
  return (
    <div>
      <h1>User Profile</h1>
      <UserProfileDetails />
    </div>
  );
}
