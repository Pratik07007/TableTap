'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="h-full w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 bg-gray-100 rounded-lg w-48 animate-pulse" />
        <div className="h-8 bg-gray-50 rounded-full w-10 animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
