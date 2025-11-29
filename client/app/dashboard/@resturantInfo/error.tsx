'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
      <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
        <AlertTriangle size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to load restaurant info</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        We couldn&apos;t retrieve your restaurant details at this time. Please check your connection.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-full hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
      >
        <RotateCw size={16} />
        Reload Info
      </button>
    </div>
  );
}
