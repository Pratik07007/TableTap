'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Type,
  DollarSign,
  AlignLeft,
  Layers,
  ImageIcon,
  Scale,
  Loader2,
  Save,
  Plus,
  X,
  Edit2
} from 'lucide-react';

export default function MenuForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    units: [] as string[],
    imageUrl: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/get/categories`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setCategories(json.data.map((c: { category: string }) => c.category));
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    const fetchUnits = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/get/units`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setUnits(json.data.map((u: { unit: string }) => u.unit));
        }
      } catch (error) {
        console.error('Failed to fetch units', error);
      }
    };

    fetchCategories();
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!editId) {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        units: [],
        imageUrl: '',
      });
      return;
    }

    const fetchItem = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/menu-items/${editId}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (res.ok && json.success) {
          const item = json.data;
          // Map backend data to form
          const units = item.unit ? item.unit.map((u: { unit: string }) => u.unit) : [];

          setFormData({
            name: item.name,
            description: item.description || '',
            price: String(item.price),
            category: item.category || (item.menuCategory ? item.menuCategory.category : ''), // Handle both raw category string or relation
            units: units,
            imageUrl: item.imageUrl || '',
          });
        } else {
          toast.error('Failed to load item details');
        }
      } catch (error) {
        toast.error('Network error');
      } finally {
        setFetching(false);
      }
    };

    fetchItem();
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      category: formData.category,
      units: formData.units, // Send as array of units
      imageUrl: formData.imageUrl,
    };

    const method = editId ? 'PUT' : 'POST';
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/menu-items${editId ? `/${editId}` : ''}`;

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
        return;
      }

      toast.success(editId ? 'Menu item updated' : 'Menu item added');

      // Refresh the list and clear edit mode
      router.refresh();
      if (editId) {
        router.push('/menu');
      } else {
        // Reset form if adding new
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          units: [],
          imageUrl: '',
        });
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, units: [...prev.units, value] };
      } else {
        return { ...prev, units: prev.units.filter(unit => unit !== value) };
      }
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === "") {
      toast.error("Category name cannot be empty.");
      return;
    }
    const upperCategory = newCategory.toUpperCase();
    if (categories.includes(upperCategory)) {
      toast.error("Category already exists.");
      return;
    }
    setCategories(prev => [...prev, upperCategory]);
    setFormData(prev => ({ ...prev, category: upperCategory }));
    setNewCategory("");
    toast.success(`Category "${upperCategory}" added and selected.`);
  };

  const handleAddNewUnit = () => {
    if (newUnit.trim() === "") {
      toast.error("Unit name cannot be empty.");
      return;
    }
    const upperUnit = newUnit.toUpperCase();
    if (units.includes(upperUnit)) {
      toast.error("Unit already exists.");
      return;
    }
    setUnits(prev => [...prev, upperUnit]);
    if (!formData.units.includes(upperUnit)) {
      setFormData(prev => ({ ...prev, units: [...prev.units, upperUnit] }));
    }
    setNewUnit("");
    toast.success(`Unit "${upperUnit}" added and selected.`);
  };

  const handleCancel = () => {
    router.push('/menu');
  };

  if (fetching) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-orange-600">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm font-medium">Loading item details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {editId ? <Edit2 size={18} className="text-orange-600" /> : <Plus size={18} className="text-orange-600" />}
          {editId ? 'Edit Menu Item' : 'Add New Item'}
        </h2>
        {editId && (
          <button
            onClick={handleCancel}
            className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <X size={14} /> Cancel Editing
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Type size={14} /> Item Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Chicken Momo"
              required
              aria-label="Item Name"
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
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                aria-label="Price"
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
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a brief description of the dish..."
            rows={3}
            aria-label="Description"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Layers size={14} /> Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              aria-label="Category"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Or add new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                aria-label="Add new category"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                aria-label="Add Category"
                className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <ImageIcon size={14} /> Image URL
            </label>
            <input
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              aria-label="Image URL"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Quantity Types */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Scale size={14} /> Serving Size / Quantity Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {units.map((q) => (
              <label key={q} className="cursor-pointer relative">
                <input
                  type="checkbox"
                  name="units"
                  value={q}
                  checked={formData.units.includes(q)}
                  onChange={handleUnitChange}
                  className="peer sr-only"
                  aria-label={`Select unit ${q}`}
                  required={formData.units.length === 0}
                />
                <div className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm font-medium text-center capitalize transition-all peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-700 peer-hover:bg-gray-50">
                  {q}
                </div>
              </label>
            ))}
            {/* Add custom option if needed, but keeping simple for now */}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Or add new unit"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              aria-label="Add new unit"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={handleAddNewUnit}
              aria-label="Add Unit"
              className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
            >
              Add
            </button>
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
                {editId ? <Save size={18} /> : <Plus size={18} />}
                {editId ? 'Update Item' : 'Add to Menu'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

