"use client";

import { useEffect, useState } from "react";

export function useClientSession() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session-info`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!data?.success) {
          setError(data?.error);
        }
        setIsLoggedIn(true);
        setUser(data?.user);
        setLoading(false);
      } catch {
        setError("We cannot verify your session at this moment");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { user, isLoggedIn, loading, error };
}
