import UserSide from "../_components/dashboard/UserSide"
import { getUserIDandRoleFromToken } from "@/utils/getUserIdandRoleFromToken"

export default async function Page() {
    const { role, name } = await getUserIDandRoleFromToken();

    if (role === 'ADMIN') {
        return (
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name || 'Admin'}</h1>
                <p className="text-gray-500">Here&apos;s what&apos;s happening with your restaurant today.</p>
            </div>
        );
    }

    return <UserSide />;
}
