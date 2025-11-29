'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Type,
  AlignLeft,
  Layers,
  Scale,
  Loader2,
  Save,
  X
} from 'lucide-react';

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  quantityType: string;
  imageUrl?: string;
  isAvailable: boolean;
};

const categories = [
  'hot drink',
  'cold drink',
  'alcoholic drink',
  'vegan food',
  'chinese',
  'nepali',
  'thai',
  'continental',
];

const quantityTypes = [
  'serving',
  'half serving',
  'full serving',
  'half plate',
  'full plate',
];

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success) setItems(json.data);
      else toast.error('Failed to load menu items');
    } catch { toast.error('Network error'); }
  };

  useEffect(() => {
    const id = setTimeout(() => { void loadItems(); }, 0);
    return () => clearTimeout(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get('name') || ''),
      description: String(fd.get('description') || ''),
      price: Number(fd.get('price') || 0),
      category: String(fd.get('category') || ''),
      quantityType: String(fd.get('quantityType') || ''),
      imageUrl: String(fd.get('imageUrl') || ''),
    };
    const method = editingId ? 'PUT' : 'POST';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items${editingId ? `/${editingId}` : ''}`;
    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = Array.isArray(json.message) ? json.message[0]?.message : json.message;
        toast.error(typeof msg === 'string' ? msg : 'Save failed');
        setLoading(false);
        return;
      }
      toast.success(editingId ? 'Menu item updated' : 'Menu item added');
      form.reset();
      setEditingId(null);
      await loadItems();
      setLoading(false);
    } catch {
      toast.error('Network error');
      setLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    const confirmUpdate = window.confirm('Proceed to update this menu item?');
    if (!confirmUpdate) return;
    setEditingId(item.id);
    const form = document.getElementById('menu-form') as HTMLFormElement | null;
    if (!form) return;
    (form.elements.namedItem('name') as HTMLInputElement).value = item.name;
    (form.elements.namedItem('description') as HTMLInputElement).value = item.description || '';
    (form.elements.namedItem('price') as HTMLInputElement).value = String(item.price);
    (form.elements.namedItem('category') as HTMLSelectElement).value = item.category;
    const radios = form.querySelectorAll('input[name="quantityType"]');
    radios.forEach((el) => {
      const input = el as HTMLInputElement;
      input.checked = input.value === item.quantityType;
    });
    (form.elements.namedItem('imageUrl') as HTMLInputElement).value = item.imageUrl || '';

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Are you sure you want to delete this item?');
    if (!ok) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/${id}`, {
        method: 'DELETE', credentials: 'include'
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error('Delete failed'); return; }
      toast.success('Menu item deleted');
      await loadItems();
    } catch { toast.error('Network error'); }
  };

  const handleMakeAvailable = async (id: string) => {
    const ok = window.confirm('Make this item available?');
    if (!ok) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/${id}/available`, {
        method: 'PATCH', credentials: 'include'
      });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error('Operation failed'); return; }
      toast.success('Item is now available');
      await loadItems();
    } catch { toast.error('Network error'); }
  };

  const cancelEdit = () => {
    setEditingId(null);
    const form = document.getElementById('menu-form') as HTMLFormElement | null;
    if (form) form.reset();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 mb-8 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-sm text-gray-500">Add, edit, and organize your restaurant&apos;s offerings.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-8">

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {editingId ? <Edit2 size={18} className="text-orange-600" /> : <Plus size={18} className="text-orange-600" />}
              {editingId ? 'Edit Menu Item' : 'Add New Item'}
            </h2>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <X size={14} /> Cancel Editing
              </button>
            )}
          </div>

          <form id="menu-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Type size={14} /> Item Name
                </label>
                <input
                  name="name"
                  placeholder="e.g. Chicken Momo"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <DollarSign size={14} /> Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-bold text-sm">$</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <AlignLeft size={14} /> Description
              </label>
              <textarea
                name="description"
                placeholder="Enter a brief description of the dish..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Layers size={14} /> Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected className="text-gray-400">Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <ImageIcon size={14} /> Image URL
                </label>
                <input
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Quantity Types */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Scale size={14} /> Serving Size / Quantity Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {quantityTypes.map((q) => (
                  <label key={q} className="cursor-pointer relative">
                    <input
                      type="radio"
                      name="quantityType"
                      value={q}
                      required
                      className="peer sr-only"
                    />
                    <div className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium text-center capitalize transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 peer-hover:bg-gray-50">
                      {q}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full md:w-auto px-8 py-3 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                  : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20'
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Processing...
                  </>
                ) : (
                  <>
                    {editingId ? <Save size={18} /> : <Plus size={18} />}
                    {editingId ? 'Update Item' : 'Add to Menu'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Items List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Utensils className="text-orange-600" size={20} />
              Current Menu Items
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                {items.length}
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
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No items in the menu yet. Start adding above!
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{it.name}</div>
                        {it.description && <div className="text-gray-500 text-xs mt-0.5 line-clamp-1 max-w-[200px]">{it.description}</div>}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium capitalize">
                          {it.category}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 capitalize">{it.quantityType}</td>
                      <td className="p-4 font-bold text-gray-900">${it.price.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${it.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {it.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(it)}
                            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 size={16} />
                          </button>
                          {!it.isAvailable && (
                            <button
                              onClick={() => handleMakeAvailable(it.id)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Make Available"
                            >
                              <Save size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(it.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
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
      </div>
    </div>
  );
}