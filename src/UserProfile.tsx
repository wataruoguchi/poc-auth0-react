import { useFetch } from "./hooks/use-fetch";

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  token: string;
};

export function UserProfile() {
  const { useFetchData } = useFetch();
  const {
    data: profile,
    isLoading,
    error,
  } = useFetchData<UserProfile>("https://api.example.com/user");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!profile) return null;

  return (
    <div>
      <h1>User Profile</h1>
      <p>
        Name: {profile.firstName} {profile.lastName}
      </p>
      <p>Token: {profile.token}</p>
    </div>
  );
}
