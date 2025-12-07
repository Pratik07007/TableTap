'use client';

import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

type MenuItem = {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    unit: { unit: string }[];
    menuCategory: { category: string, id: string };
};

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
};

export default function TakeOrderInterface({ menuItems }: { menuItems: MenuItem[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            } else {
                return [...prevCart, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
            }
        });
        toast.success(`${item.name} added to cart`);
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
            if (existingItem && existingItem.quantity > 1) {
                return prevCart.map(cartItem =>
                    cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
                );
            } else {
                return prevCart.filter(cartItem => cartItem.id !== itemId);
            }
        });
        toast.error(`Item removed from cart`);
    };

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gray-50 min-h-screen">
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Menu</h2>
                <div className="space-y-4">
                    {menuItems.map(item => (
                        <div key={item.id} className="flex items-center bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
                            {/* {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-lg object-cover mr-4" />
                            )} */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-gray-700 font-medium">${item.price.toFixed(2)}</span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="ml-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800">
                    <ShoppingCart className="mr-2 text-orange-500" /> Cart
                </h2>
                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                    <div>
                        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-2">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="mx-2 font-bold text-gray-800">{item.quantity}</span>
                                        <button
                                            onClick={() => {
                                                const menuItem = menuItems.find(mi => mi.id === item.id);
                                                if (menuItem) {
                                                    addToCart(menuItem);
                                                }
                                            }}
                                            className="text-gray-500 hover:text-green-500 p-1 rounded-full hover:bg-green-50"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr className="my-4 border-gray-200" />
                        <div className="flex justify-between font-bold text-lg text-gray-800">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <button className="w-full bg-green-500 text-white py-3 rounded-lg mt-6 font-bold hover:bg-green-600 transition-colors">
                            Place Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
