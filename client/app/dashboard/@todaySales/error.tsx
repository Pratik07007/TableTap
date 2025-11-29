'use client';

import { AlertOctagon } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center min-h-[400px]">
      <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
        <AlertOctagon size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Sales Report Unavailable</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        {error.message || "We couldn't load today's sales data. Please try refreshing the dashboard."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
      >
        Retry Loading
      </button>
    </div>
  );
}
