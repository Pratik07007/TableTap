"use client"
import { LayoutDashboard, X, Menu } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";

export const Navbar = ({
    isLoggedIn,
    onLogout,
    user
}: {
    isLoggedIn: boolean,
    user: { name: string, role: string } | null
    onLogout: () => void
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    const navLinks = [
        { name: 'System Features', href: '#features' },
        { name: 'QR Solution', href: '#benefits' },
        { name: 'FAQ', href: '#faq' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-white shadow-sm py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                {/* Logo */}
                <div
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-orange-600 cursor-pointer"
                >
                    <LayoutDashboard className="h-8 w-8" />
                    <span className="text-2xl font-bold text-gray-900">
                        Table<span className="text-orange-600">Tap</span>
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-gray-600 hover:text-orange-600 font-medium text-sm"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Auth Section */}
                <div className="hidden md:flex items-center gap-4">
                    {isLoggedIn && user ? (
                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-semibold">
                                {user.name} <span className="text-xs">({user.role})</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold"
                            >
                                Logout
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold"
                            >
                                Dashboard
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push('/login')}
                                className="text-gray-600 hover:text-orange-600 font-semibold px-3 py-2 text-sm"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push('/register?role=ADMIN')}
                                className="px-4 py-2 rounded-full bg-orange-600 text-white text-sm font-semibold"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-700 p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t p-4 flex flex-col space-y-3">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-gray-600 font-medium py-2"
                        >
                            {link.name}
                        </a>
                    ))}

                    <div className="border-t pt-3 mt-2">
                        {isLoggedIn && user ? (
                            <div className="flex flex-col gap-3">
                                <div className="px-4 py-2 rounded-lg bg-orange-50 text-orange-700 text-sm font-semibold">
                                    {user.name} ({user.role})
                                </div>
                                <button onClick={onLogout} className="w-full py-2 rounded-lg bg-gray-100 text-red-600 font-semibold">
                                    Logout
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-2 rounded-lg bg-orange-600 text-white font-semibold"
                                >
                                    Dashboard
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => router.push('/register?role=ADMIN')}
                                    className="w-full py-2 rounded-lg bg-orange-600 text-white font-semibold"
                                >
                                    Create Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
