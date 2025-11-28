'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
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
                    const raw: unknown = data.message as unknown;
                    let msg: unknown = raw;
                    if (Array.isArray(raw)) {
                        msg = (raw[0] as { message?: string })?.message ?? raw[0];
                    } else if (typeof raw === 'object' && raw && 'errors' in (raw as Record<string, unknown>)) {
                        const errs = (raw as { errors?: { message?: string }[] }).errors;
                        msg = errs && errs[0]?.message;
                    }
                    toast.error(typeof msg === 'string' ? msg : 'Email verification failed');
                }
            } catch (error) {
                setStatus('error');
                toast.error('Email verification failed');
            }
        };
        verify();
    }, [token]);

    return (


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
    )
}
