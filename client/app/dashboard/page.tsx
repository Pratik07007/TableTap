import UserSide from "../_components/dashboard/UserSide"
import AdminSide from "../_components/dashboard/AdminSide"
import { getUserIDandRoleFromToken } from "@/utils/getUserIdandRoleFromToken"

export default async function Page() {
    const { role } = await getUserIDandRoleFromToken()
    return (
        <>
            {role === 'ADMIN' ? (
                <AdminSide />
            ) : (
                <UserSide />
            )}
        </>
    )
}
