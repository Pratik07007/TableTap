'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Store,
  MapPin,
  Share2,
  Phone,
  Mail,
  LayoutDashboard,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function RegisterRestaurantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resturant/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const error = Array.isArray(json.message)
          ? json.message[0].message
          : json.message;
        toast.error(typeof error === 'string' ? error : 'Failed to register restaurant');
        setLoading(false);
        return;
      }

      toast.success('Restaurant registered successfully');
      router.push('/dashboard');
    } catch {
      toast.error('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <div className="border-b border-gray-100 py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center gap-2 text-orange-600">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tighter text-gray-900">
            Table<span className="text-orange-600">Tap</span>
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-6">
        <div className="max-w-3xl w-full">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-600 mb-4">
              <Store size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Restaurant</h1>
            <p className="text-gray-500">Enter your establishment details to start managing orders.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Basic Info */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Store className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    name="name"
                    placeholder="e.g. ChiyaHub"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        name="email"
                        type="email"
                        placeholder="contact@chiyahub.com"
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      <input
                        name="phone"
                        placeholder="+977 98..."
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    name="streetAddress"
                    placeholder="e.g. Main Road, Brt"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="city"
                      placeholder="e.g. Biratnagar"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                    <input
                      name="state"
                      placeholder="e.g. Koshi"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input
                      name="zip"
                      placeholder="e.g. 56613"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      name="country"
                      placeholder="e.g. Nepal"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Social Media */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Share2 className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Social Presence <span className="text-gray-400 font-normal text-sm">(Optional)</span></h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    name="faceBookUrl"
                    placeholder="https://facebook.com/..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    name="instagramUrl"
                    placeholder="https://instagram.com/..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TikTok URL</label>
                  <input
                    name="tikTokUrl"
                    placeholder="https://tiktok.com/..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Creating Restaurant...
                </>
              ) : (
                <>
                  Complete Setup <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}