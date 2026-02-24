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
        <div className="flex flex-col flex-col-reverse xl:flex-col gap-8 items-start w-full">
          <div className="w-full">{menuForm}</div>
          <div className="w-full">{menuList}</div>
        </div>
      </div>
    </div>
  );
}
