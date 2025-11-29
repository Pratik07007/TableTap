'use client';

import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="h-full min-h-[200px] w-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-red-100 p-6 text-center">
            <div className="bg-red-50 text-red-500 p-3 rounded-full mb-3">
                <AlertCircle size={24} />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">Failed to load report</h3>
            <p className="text-gray-500 text-sm mb-4 max-w-[200px]">
                {error.message || 'Something went wrong while fetching the daily sales data.'}
            </p>
            <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <RefreshCcw size={14} />
                Try Again
            </button>
        </div>
    );
}
