import { Utensils } from 'lucide-react';
import React from 'react';
export default function Layout({
  children,
  menuForm,
  menuList
}: {
  children: React.ReactNode;
  menuForm: React.ReactNode;
  menuList: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-1 flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-sm text-gray-500">Add, edit, and organize your restaurant&apos;s offerings.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 space-y-2">
        {children}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
          <div className="xl:col-span-3 xl:sticky xl:top-32 order-2 xl:order-1">
            {menuForm}
          </div>
          <div className="xl:col-span-2 order-1 xl:order-2">
            {menuList}
          </div>
        </div>
      </div>
    </div>
  );
}
