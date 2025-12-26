"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Store,
  MapPin,
  Share2,
  Phone,
  Mail,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";

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

interface UpdateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingData: Restaurant;
}

export const UpdateRestaurantModal = ({
  isOpen,
  onClose,
  existingData,
}: UpdateRestaurantModalProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      streetAddress: String(formData.get("streetAddress") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      zip: String(formData.get("zip") || ""),
      country: String(formData.get("country") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      faceBookUrl: String(formData.get("faceBookUrl") || ""),
      tikTokUrl: String(formData.get("tikTokUrl") || ""),
      instagramUrl: String(formData.get("instagramUrl") || ""),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resturant/update`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        const errorMsg = Array.isArray(json.message)
          ? json.message[0]?.message
          : json.message;
        toast.error(
          typeof errorMsg === "string"
            ? errorMsg
            : "Failed to update restaurant"
        );
        setLoading(false);
        return;
      }
      toast.success("Restaurant updated successfully");
      router.refresh();
      onClose();
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X size={24} className="text-gray-500" />
        </button>

        <div className="p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-600 mb-4">
              <Store size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Update Restaurant
            </h2>
            <p className="text-gray-500">
              Modify your restaurant details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Store className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name
                  </label>
                  <input
                    name="name"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    defaultValue={existingData.name}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      <input
                        name="email"
                        type="email"
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                        defaultValue={existingData.email}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      <input
                        name="phone"
                        required
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                        defaultValue={existingData.phone}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Location Details
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    name="streetAddress"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    defaultValue={existingData.streetAddress}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                      defaultValue={existingData.city}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      name="state"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                      defaultValue={existingData.state}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      name="zip"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                      defaultValue={existingData.zip}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      name="country"
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                      defaultValue={existingData.country}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Share2 className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Social Presence
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook URL
                  </label>
                  <input
                    name="faceBookUrl"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    defaultValue={existingData.faceBookUrl || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram URL
                  </label>
                  <input
                    name="instagramUrl"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    defaultValue={existingData.instagramUrl || ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok URL
                  </label>
                  <input
                    name="tikTokUrl"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-gray-400"
                    defaultValue={existingData.tikTokUrl || ""}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 pt-4 bg-white">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-full font-bold shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/20"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Updating...
                  </>
                ) : (
                  <>
                    Save Changes <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
