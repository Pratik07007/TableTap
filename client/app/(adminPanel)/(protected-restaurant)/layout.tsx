import { redirect } from "next/navigation";
import { getRestaurantData } from "@/utils/getRestaurantData";

export default async function ProtectedRestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const restaurant = await getRestaurantData();

  if (!restaurant) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
