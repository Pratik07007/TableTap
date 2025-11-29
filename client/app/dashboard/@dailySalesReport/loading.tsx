'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-full min-h-[200px] w-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="bg-orange-50 text-orange-600 p-3 rounded-full mb-3">
        <Loader2 className="animate-spin" size={24} />
      </div>
      <p className="text-gray-500 text-sm font-medium animate-pulse">Loading sales data...</p>
    </div>
  );
}
