import { AdminNavbar } from "../_components/adminPanel/AdminNavbar";
import { AdminFooter } from "../_components/adminPanel/AdminFooter";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <AdminNavbar />
            <main className="flex-1">
                {children}
            </main>
            <AdminFooter />
        </div>
    );
}
