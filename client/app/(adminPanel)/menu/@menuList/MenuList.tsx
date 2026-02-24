"use client";

import { Edit2, Trash2, Save, Utensils } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  images?: { url: string }[];
  isAvailable: boolean;
  unit: { unit: string; price: number }[];
  menuCategory: { category: string; id: string };
};

export default function MenuList({
  initialItems,
}: {
  initialItems: MenuItem[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const currentEditId = searchParams.get("editId");

  const handleEdit = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("editId", id);
    router.push(`/menu?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Item deleted");
        router.refresh();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMakeAvailable = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/${id}/available`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Status updated");
        router.refresh();
      } else {
        toast.error(json.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-7xl mx-auto">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Utensils className="text-orange-600" size={20} />
          Current Menu Items
          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
            {initialItems.length}
          </span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs tracking-wider">
              <th className="p-4">Details</th>
              <th className="p-4">Category</th>
              <th className="p-4">Serving</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No items in the menu yet. Start adding to the left!
                </td>
              </tr>
            ) : (
              initialItems.map((it) => (
                <tr
                  key={it.id}
                  className={`transition-colors group ${currentEditId === it.id ? "bg-orange-50" : "hover:bg-gray-50/80"}`}
                >
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{it.name}</div>
                    {it.description && (
                      <div className="text-gray-500 text-xs mt-0.5 line-clamp-1 max-w-[200px]">
                        {it.description}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium capitalize">
                      {it.menuCategory.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 capitalize">
                    {it.unit.map((unit) => unit.unit).join(", ")}
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {it.unit.map((unit) => `$${unit.price}`).join(", ")}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${it.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {it.isAvailable ? "Available" : "Not Available"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(it.id)}
                        className={`p-2 rounded-lg transition-colors ${currentEditId === it.id ? "text-orange-600 bg-orange-100" : "text-gray-500 hover:text-orange-600 hover:bg-orange-50"}`}
                        title="Edit Item"
                      >
                        <Edit2 size={16} />
                      </button>
                      {!it.isAvailable && (
                        <button
                          onClick={() => handleMakeAvailable(it.id)}
                          disabled={togglingId === it.id}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Make Available"
                        >
                          {togglingId === it.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(it.id)}
                        disabled={deletingId === it.id}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Item"
                      >
                        {deletingId === it.id ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
