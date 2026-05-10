import UserSide from "../_components/dashboard/UserSide";
import { getUserIDandRoleFromToken } from "@/utils/getUserIdandRoleFromToken";
import { AdminAnalytics } from "../_components/dashboard/AdminAnalytics";

export default async function Page() {
    const { role, name } = await getUserIDandRoleFromToken();

    if (role === 'ADMIN') {
        return (
            <div className="flex flex-col gap-6 w-full">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name || 'Admin'}</h1>
                    <p className="text-gray-500">Here's your restaurant's live pulse and analytics overview.</p>
                </div>
                
                {/* Mount the Analytics Dashboard component */}
                <AdminAnalytics />
            </div>
        );
    }

    return <UserSide />;
}
