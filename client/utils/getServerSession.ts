import { cookies } from "next/headers";

export async function getSessionUser() {
  let user = null;
  let isLoggedIn = false;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session-info`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: `token=${token}`,
        },
      }
    );
    if (response.ok) {
      const userRes = await response.json();
      user = userRes.user;
      isLoggedIn = true;
    }
  } catch (err) {
    console.error(err);
  }

  return { user, isLoggedIn };
}
