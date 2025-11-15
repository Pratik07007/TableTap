'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

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
        <div className="min-h-screen flex">
            <div className="hidden md:flex md:w-1/2 from-indigo-500 to-purple-600 items-center justify-center relative">
                <Image
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                    alt="Restaurant interior"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                    width={1000}
                    height={1000}
                />
                <div className="relative text-white text-4xl font-bold z-10">TableTap</div>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md px-8 text-center">
                    {!token && (
                        <>
                            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Error</h1>
                            <p className="text-gray-600">Token not found.</p>
                        </>
                    )}
                    {token && status === 'loading' && (
                        <>
                            <h1 className="text-2xl font-semibold text-gray-800 mb-2">Verifying your email…</h1>
                            <p className="text-gray-600">Please wait while we confirm your account.</p>
                        </>
                    )}
                    {token && status === 'success' && (
                        <>
                            <h1 className="text-2xl font-semibold text-green-600 mb-2">Email verified!</h1>
                            <p className="text-gray-600">You can now <a href="/login" className="text-indigo-600 hover:underline">sign in</a>.</p>
                        </>
                    )}
                    {token && status === 'error' && (
                        <>
                            <h1 className="text-2xl font-semibold text-red-600 mb-2">Verification failed</h1>
                            <p className="text-gray-600">The link may be invalid or expired.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Page;
