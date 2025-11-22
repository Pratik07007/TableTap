export const getSessionInfo = async (token: string) => {
  if (!token) return null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-token`,
      {
        method: "POST",
        headers: { token },
      }
    );
    const data = await res.json();

    return data;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
};
