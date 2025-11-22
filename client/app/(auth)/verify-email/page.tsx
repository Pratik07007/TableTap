'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { LayoutDashboard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function Page() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>(token ? 'loading' : 'idle');

    useEffect(() => {
        const verify = async () => {
            if (!token) return;
            setStatus('loading');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    setStatus('success');
                    toast.success('Email verified successfully');
                } else {
                    setStatus('error');
                    toast.error(data.message || 'Email verification failed');
                }
            } catch (error) {
                setStatus('error');
                toast.error('Email verification failed');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side: Branding */}
            <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-orange-600 to-amber-200 items-center justify-center relative overflow-hidden">

                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>

                <div className="relative z-10 text-center px-8">
                    <div className="flex items-center justify-center gap-3 text-white mb-4">
                        <LayoutDashboard className="h-10 w-10" />
                        <span className="text-4xl font-bold tracking-tighter">
                            Table<span className="text-orange-200">Tap</span>
                        </span>
                    </div>
                    <p className="text-orange-100 text-lg font-light max-w-md mx-auto">
                        Join thousands of restaurant owners streamlining their operations today.
                    </p>
                </div>
            </div>

            {/* Right Side: Status */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
                <div className="w-full max-w-md px-8 text-center py-12">

                    {!token && (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                <XCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h1>
                            <p className="text-gray-500">Token not found. Please check your link.</p>
                        </div>
                    )}

                    {token && status === 'loading' && (
                        <div className="flex flex-col items-center animate-in fade-in">
                            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h1>
                            <p className="text-gray-500">Please wait while we confirm your account.</p>
                        </div>
                    )}

                    {token && status === 'success' && (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
                            <p className="text-gray-500 mb-8">Your account has been successfully activated.</p>
                            <Link
                                href="/login"
                                className="px-8 py-3 bg-orange-600 text-white rounded-full font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
                            >
                                Continue to Login
                            </Link>
                        </div>
                    )}

                    {token && status === 'error' && (
                        <div className="flex flex-col items-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                <XCircle size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                            <p className="text-gray-500">The link may be invalid or has expired.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Page;