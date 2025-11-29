'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Store, MapPin, Share2, Phone, Mail, LayoutDashboard, ArrowRight, Loader2 } from 'lucide-react';

type Restaurant = {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  faceBookUrl?: string | null;
  tikTokUrl?: string | null;
  instagramUrl?: string | null;
};

export default function UpdateRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<Restaurant | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resturant/me`, {
          method: 'GET',
          credentials: 'include',
        });
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          const data = json.data?.resturant ?? json.data;
          setExisting(data as Restaurant);
        } else {
          toast.error('No restaurant found. Please create one first.');
          // router.push('/register-resturant');
        }
      } catch {
        toast.error('Failed to load restaurant');
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get('name') || ''),
      streetAddress: String(formData.get('streetAddress') || ''),
      city: String(formData.get('city') || ''),
      state: String(formData.get('state') || ''),
      zip: String(formData.get('zip') || ''),
      country: String(formData.get('country') || ''),
      phone: String(formData.get('phone') || ''),
      email: String(formData.get('email') || ''),
      faceBookUrl: String(formData.get('faceBookUrl') || ''),
      tikTokUrl: String(formData.get('tikTokUrl') || ''),
      instagramUrl: String(formData.get('instagramUrl') || ''),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resturant/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = Array.isArray(json.message) ? json.message[0]?.message : json.message;
        toast.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to update restaurant');
        setLoading(false);
        return;
      }
      toast.success('Restaurant updated successfully');
      router.push('/dashboard');
    } catch {
      toast.error('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">


      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="max-w-3xl w-full">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-600 mb-4">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Update Your Restaurant</h1>
            <p className="text-gray-500">Modify your restaurant details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Store className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input name="name" required disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.name || ''} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input name="email" type="email" required disabled={loading} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.email || ''} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input name="phone" required disabled={loading} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.phone || ''} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input name="streetAddress" required disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.streetAddress || ''} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input name="city" required disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.city || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                    <input name="state" required disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.state || ''} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input name="zip" required disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.zip || ''} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input name="country" required disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.country || ''} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Share2 className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Social Presence</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input name="faceBookUrl" disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.faceBookUrl || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input name="instagramUrl" disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.instagramUrl || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
                  <input name="tikTokUrl" disabled={loading} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400" defaultValue={existing?.tikTokUrl || ''} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20'}`}>
              {loading ? (<><Loader2 className="animate-spin" size={20} /> Updating Restaurant...</>) : (<>Save Changes <ArrowRight size={20} /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}