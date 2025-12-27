import { Utensils } from "lucide-react";
import React from "react";
export default function Layout({
  children,
  menuForm,
  menuList,
}: {
  children: React.ReactNode;
  menuForm: React.ReactNode;
  menuList: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-12 mt-16">
      <div className="max-w-[96%] mx-auto px-4 space-y-2">
        {children}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
          <div className="xl:col-span-3 xl:sticky xl:top-32 order-2 xl:order-1">
            {menuForm}
          </div>
          <div className="xl:col-span-2 order-1 xl:order-2">{menuList}</div>
        </div>
      </div>
    </div>
  );
}
