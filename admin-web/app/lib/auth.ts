import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("token");

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Cookie: `token=${accessToken.value}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to get current user");
  }

  return response.json();
}