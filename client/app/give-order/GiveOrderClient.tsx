"use client";

import {
  Plus,
  Minus,
  ShoppingCart,
  X,
  Check,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
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

export default function GiveOrderClient({
  menuItems,
  restaurantId,
}: {
  menuItems: MenuItem[];
  restaurantId: string;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const addToCart = (item: MenuItem, unit: { unit: string; price: number }) => {
    const uniqueId = `${item.id}-${unit.unit}`;
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.uniqueId === uniqueId
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
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
        (cartItem) => cartItem.uniqueId === uniqueId
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter((cartItem) => cartItem.uniqueId !== uniqueId);
      }
    });
  };

  const deleteFromCart = (uniqueId: string) => {
    setCart((prevCart) =>
      prevCart.filter((cartItem) => cartItem.uniqueId !== uniqueId)
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          unitName: item.unitName,
          quantity: item.quantity,
        })),
        restaurantId: restaurantId,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/customer/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to place order");
      }

      toast.success("Order placed successfully!");
      setCart([]);
      setShowConfirmation(false);
      router.push("/my-orders");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            Give <span className="text-orange-600">Order</span>
          </h1>
        </div>
        <Link
          href="/my-orders"
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          My Orders
        </Link>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="lg:col-span-2 space-y-6">
          {menuItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No menu items found for this restaurant.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between border border-gray-100"
                >
                  <div className="flex gap-4">
                    {item.imageUrl && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.unit && item.unit.length > 0 ? (
                      item.unit.map((u) => (
                        <button
                          key={u.unit}
                          onClick={() => addToCart(item, u)}
                          className="px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-semibold hover:bg-orange-100 transition-colors flex items-center gap-1 active:scale-95 transform"
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
          )}
        </div>

        {/* Cart Section - Desktop: Sticky, Mobile: Fixed Bottom Sheet/Modal style if needed, currently reusing sticky layout */}
        <div className="hidden lg:flex bg-white rounded-xl shadow-md p-6 sticky top-24 self-start max-h-[calc(100vh-8rem)] flex-col">
          <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 border-b pb-4">
            <ShoppingCart className="mr-2 text-orange-500" /> Your Order
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-200 min-h-[300px]">
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
                      <h4 className="font-bold text-gray-900 line-clamp-1">
                        {item.name}
                      </h4>
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
                            (mi) => mi.id === item.menuItemId
                          );
                          const unit = menuItem?.unit.find(
                            (u) => u.unit === item.unitName
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
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 active:scale-[0.98]"
              >
                Place Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        {cart.length > 0 && (
          <button
            onClick={() => setShowConfirmation(true)}
            className="w-full bg-orange-600 text-white py-4 px-6 rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-between font-bold text-lg animate-in slide-in-from-bottom-5 fade-in duration-300"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 px-2 py-0.5 rounded text-sm">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <span>View Cart</span>
            </div>
            <span>${subtotal.toFixed(2)}</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal (Acts as Cart view on Mobile/Confirm on Desktop) */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-2xl font-bold text-gray-900">Your Order</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body (Cart Items) */}
            <div className="p-6 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.uniqueId}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <div className="text-sm text-gray-500 font-medium">
                        {item.unitName} ·{" "}
                        <span className="text-orange-600">${item.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => removeFromCart(item.uniqueId)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const menuItem = menuItems.find(
                            (mi) => mi.id === item.menuItemId
                          );
                          const unit = menuItem?.unit.find(
                            (u) => u.unit === item.unitName
                          );
                          if (menuItem && unit) addToCart(menuItem, unit);
                        }}
                        className="text-gray-400 hover:text-green-500 p-1"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50 rounded-b-3xl">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Total Amount</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading || cart.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                  loading || cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-green-600/30"
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  "Confirm Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
