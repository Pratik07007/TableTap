import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const getUserIDandRoleFromToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: "ADMIN" | "USER";
      name: string;
    };
    return {
      isLoggedIn: true,
      id: decoded.id,
      role: decoded.role,
      name: decoded.name,
    };
  } catch {
    return { isLoggedIn: false, id: null, role: null, name: null };
  }
};
