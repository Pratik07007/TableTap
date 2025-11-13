'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

function Page() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handlePageReload = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-email`, {
                method: 'POST',
                body: JSON.stringify({ token }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Email verified successfully');
            } else {
                toast.error('Email verification failed');
            }
        } catch (error) {
            toast.error('Email verification failed');
        }
    };

    useEffect(() => {
        handlePageReload();
    }, [token]);

    if (!token) {
        return (
            <div>
                <h1>Error</h1>
                <p>Token not found</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Verify Email</h1>
            <p>Token: {token}</p>
        </div>
    );
}

export default Page;
