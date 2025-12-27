"use client";

import {
  Plus,
  Minus,
  ShoppingCart,
  X,
  Check,
  Loader2,
  ArrowLeft,
  Utensils,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
  resturantID,
}: {
  menuItems: MenuItem[];
  resturantID: string;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Group items by category
  const groupedItems = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      const category = item.menuCategory?.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menuItems]);

  const categories = Object.keys(groupedItems);

  useEffect(() => {
    if (categories.length > 0) setActiveCategory(categories[0]);
  }, [categories]);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const headerOffset = 140; // Approx height of sticky headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

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

  const getItemQuantityInCart = (itemId: string) => {
    return cart
      .filter((c) => c.menuItemId === itemId)
      .reduce((acc, curr) => acc + curr.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          unitName: item.unitName,
          quantity: item.quantity,
        })),
        resturantID: resturantID,
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
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Main Header */}
      <div className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <Utensils size={20} />
              </span>
              Menu
            </h1>
          </div>
          <Link
            href="/my-orders"
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-full transition-colors flex items-center gap-2"
          >
            My Orders
            <ArrowLeft className="rotate-180" size={16} />
          </Link>
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide flex gap-2 pb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu List */}
        <div className="lg:col-span-2 space-y-8">
          {menuItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Utensils className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No Items Found
              </h3>
              <p className="text-gray-500 mt-2">
                This restaurant hasn't added any menu items yet.
              </p>
            </div>
          ) : (
            categories.map((category) => (
              <section
                key={category}
                id={`category-${category}`}
                className="scroll-mt-32"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {category}
                  <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {groupedItems[category].length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {groupedItems[category].map((item) => {
                    const qtyInCart = getItemQuantityInCart(item.id);
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3 }}
                        key={item.id}
                        className={`bg-white rounded-2xl p-4 flex flex-col justify-between border transition-all hover:shadow-lg ${
                          qtyInCart > 0
                            ? "border-orange-200 shadow-md ring-1 ring-orange-100"
                            : "border-gray-100 shadow-sm"
                        }`}
                      >
                        <div className="flex gap-4 mb-4">
                          <div className="flex-1 min-w-0">
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

                        <div className="mt-auto">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Select Size
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.unit && item.unit.length > 0 ? (
                              item.unit.map((u) => (
                                <button
                                  key={u.unit}
                                  onClick={() => addToCart(item, u)}
                                  className="group flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-orange-600 hover:text-white border border-gray-200 hover:border-orange-600 rounded-xl transition-all active:scale-95"
                                >
                                  <span className="text-sm font-medium">
                                    {u.unit}
                                  </span>
                                  <span className="text-xs font-bold bg-white text-gray-900 group-hover:text-orange-600 px-1.5 py-0.5 rounded-md shadow-sm">
                                    ${u.price}
                                  </span>
                                  <Plus
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 -ml-1 transition-opacity"
                                  />
                                </button>
                              ))
                            ) : (
                              <p className="text-sm text-red-400 italic">
                                Unavailable
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Cart Section - Desktop */}
        <div className="hidden lg:flex bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sticky top-40 self-start max-h-[calc(100vh-10rem)] flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold flex items-center text-gray-900">
              <ShoppingCart className="mr-2 text-orange-600" size={24} />
              Your Order
            </h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-200 min-h-[200px]">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 py-10">
                <div className="bg-gray-50 p-4 rounded-full">
                  <ShoppingCart size={32} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium">Your cart is empty</p>
                <p className="text-xs text-center max-w-[200px]">
                  Add items from the menu to start your order
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    key={item.uniqueId}
                    className="flex flex-col bg-gray-50 rounded-xl p-3 relative group"
                  >
                    <button
                      onClick={() => deleteFromCart(item.uniqueId)}
                      className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50 z-10"
                    >
                      <X size={14} />
                    </button>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          {item.unitName}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        ${item.price} each
                      </span>
                      <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 h-8">
                        <button
                          onClick={() => removeFromCart(item.uniqueId)}
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-l-lg transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-8 text-center border-x border-gray-100">
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
                          className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-r-lg transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold text-gray-900">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setShowConfirmation(true)}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <span>Checkout</span>
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Floating Action Button */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => setShowConfirmation(true)}
              className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between font-bold"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </div>
                <span>View Cart</span>
              </div>
              <span>${subtotal.toFixed(2)}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal / Mobile Cart View */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end lg:items-center justify-center lg:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full lg:max-w-md lg:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-3xl z-10 sticky top-0">
                <h3 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronDown size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Modal Body (Cart Items) */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Your cart is empty.
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.uniqueId}
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl"
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {item.name}
                        </h4>
                        <div className="text-xs text-gray-500 font-medium mt-1">
                          {item.unitName} ·{" "}
                          <span className="text-orange-600 font-bold">
                            ${item.price}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-xl shadow-sm border border-gray-200">
                        <button
                          onClick={() => removeFromCart(item.uniqueId)}
                          className="text-gray-400 hover:text-red-500 w-6 h-6 flex items-center justify-center transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">
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
                          className="text-gray-400 hover:text-green-500 w-6 h-6 flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50 lg:rounded-b-3xl pb-10 lg:pb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all ${
                    loading || cart.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                      : "bg-orange-600 text-white hover:bg-orange-700 shadow-orange-600/30 active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      Confirm Order <Check size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
