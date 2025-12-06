'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Form Error</h2>
            <p className="text-gray-500 mb-4">Failed to load the form properly.</p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
