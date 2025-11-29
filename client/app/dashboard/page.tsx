import { getSessionUser } from "@/utils/getServerSession"
import UserSide from "../_components/dashboard/UserSide"
import AdminSide from "../_components/dashboard/AdminSide"

export default async function Page() {
    const { user } = await getSessionUser()

    return (
        <>
            {user?.role === 'ADMIN' ? (
                <AdminSide />
            ) : (
                <UserSide />
            )}
        </>
    )
}
