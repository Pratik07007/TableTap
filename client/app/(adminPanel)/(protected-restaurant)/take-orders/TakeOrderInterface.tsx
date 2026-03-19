"use client";

import { Plus, Minus, ShoppingCart, X, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  images?: { url: string }[];
  isAvailable: boolean;
  unit: { unit: string; price: number }[];
  menuCategory: { category: string; id: string };
};

type CartItem = {
  uniqueId: string;
  menuItemId: string;
  name: string;
  unitName: string;
  price: number;
  quantity: number;
};

export default function TakeOrderInterface({
  menuItems,
}: {
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeImageIndices, setActiveImageIndices] = useState<
    Record<string, number>
  >({});
  const [customerEmail, setCustomerEmail] = useState("");

  const [discount, setDiscount] = useState<number>(0);
  const nextImage = (
    itemId: string,
    maxImages: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setActiveImageIndices((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) + 1) % maxImages,
    }));
  };
  const prevImage = (
    itemId: string,
    maxImages: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setActiveImageIndices((prev) => ({
      ...prev,
      [itemId]: ((prev[itemId] || 0) - 1 + maxImages) % maxImages,
    }));
  };
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const addToCart = (item: MenuItem, unit: { unit: string; price: number }) => {
    const uniqueId = `${item.id}-${unit.unit}`;
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.uniqueId === uniqueId,
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      } else {
        return [
          ...prevCart,
          {
            uniqueId,
            menuItemId: item.id,
            name: item.name,
            unitName: unit.unit,
            price: unit.price,
            quantity: 1,
          },
        ];
      }
    });
    toast.success(`${item.name} (${unit.unit}) added`);
  };

  const removeFromCart = (uniqueId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.uniqueId === uniqueId,
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem,
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.uniqueId !== uniqueId);
      }
    });
  };

  const deleteFromCart = (uniqueId: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartItem) => cartItem.uniqueId !== uniqueId),
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const finalTotal = Math.max(0, subtotal - discount);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          unitName: item.unitName,
          quantity: item.quantity,
        })),
        discount: Number(discount),
        customerEmail: customerEmail || undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to place order");
      }

      toast.success("Order placed successfully!");
      setCart([]);
      setDiscount(0);
      setShowConfirmation(false);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to place order";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Menu List */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-800">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              {item.images && item.images.length > 0 && (
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden group mb-4">
                  <AnimatePresence initial={false}>
                    <motion.img
                      key={`${item.id}-${activeImageIndices[item.id] || 0}`}
                      src={item.images[activeImageIndices[item.id] || 0].url}
                      alt={item.name}
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </AnimatePresence>
                  <button
                    onClick={(e) =>
                      prevImage(item.id, item.images?.length || 1, e)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1"
                  >
                    ◀
                  </button>
                  <button
                    onClick={(e) =>
                      nextImage(item.id, item.images?.length || 1, e)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1"
                  >
                    ▶
                  </button>
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.unit && item.unit.length > 0 ? (
                  item.unit.map((u) => (
                    <button
                      key={u.unit}
                      onClick={() => addToCart(item, u)}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-semibold hover:bg-orange-100 transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} />
                      {u.unit}{" "}
                      <span className="text-xs text-orange-500">
                        ${u.price}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-red-400 italic">
                    No units available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-xl shadow-md p-6 sticky top-6 self-start h-[calc(100vh-3rem)] flex flex-col">
        <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 border-b pb-4">
          <ShoppingCart className="mr-2 text-orange-500" /> Current Order
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <ShoppingCart size={48} className="text-gray-200" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.uniqueId}
                className="flex flex-col bg-gray-50 rounded-lg p-3 relative group"
              >
                <button
                  onClick={() => deleteFromCart(item.uniqueId)}
                  className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                      {item.unitName}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-500">
                    ${item.price} each
                  </span>
                  <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
                    <button
                      onClick={() => removeFromCart(item.uniqueId)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold text-sm min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const menuItem = menuItems.find(
                          (mi) => mi.id === item.menuItemId,
                        );
                        const unit = menuItem?.unit.find(
                          (u) => u.unit === item.unitName,
                        );
                        if (menuItem && unit) addToCart(menuItem, unit);
                      }}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Customer Email (optional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Discount</span>
                <div className="flex items-center gap-1 w-24">
                  <span className="text-gray-400">$</span>
                  <input
                    type="number"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-gray-50 border-b border-gray-300 focus:border-orange-500 focus:outline-none text-right font-medium"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-dashed">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
            >
              Place Order (${finalTotal.toFixed(2)})
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <Check size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Confirm Order
              </h3>
              <p className="text-gray-500 mt-2">
                Are you sure you want to place this order?
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 border border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items ({cart.filter((i) => i.quantity > 0).length})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Discount</span>
                <span className="text-red-500">-${discount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg text-gray-900">
                <span>Total to Pay</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Confirm Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
