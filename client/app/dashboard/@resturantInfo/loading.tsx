'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[300px]">
      <div className="bg-orange-50 text-orange-600 p-4 rounded-full mb-4">
        <Loader2 className="animate-spin" size={32} />
      </div>
      <div className="space-y-3 w-full max-w-xs">
        <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto animate-pulse" />
        <div className="h-3 bg-gray-50 rounded-full w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  );
}
