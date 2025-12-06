import { cookies } from 'next/headers';
import MenuList from './MenuList';

async function getMenuItems() {
  try {
    const cookieStore = await cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (!res.ok) {

      return [];
    }

    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    return [];
  }
}

export default async function MenuListPage() {
  const items = await getMenuItems();
  return <MenuList initialItems={items} />;
}
