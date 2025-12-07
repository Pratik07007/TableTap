import TakeOrderInterface from "./TakeOrderInterface";

import { cookies } from 'next/headers';
async function getMenuItems() {
    const token = (await cookies()).get('token')?.value;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items`, {
        cache: 'no-store',
        headers: {
            Cookie: `token=${token}`
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch menu items');
    }
    return res.json();
}

export default async function TakeOrdersPage() {
    const menuItemsData = await getMenuItems();

    return <TakeOrderInterface menuItems={menuItemsData.data} />;
}