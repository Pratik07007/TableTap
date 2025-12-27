import React from "react";
import Link from "next/link";
import { ClipboardList, Layout, QrCode } from "lucide-react";

const UserSide = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-transparent p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-orange-50 rounded-2xl mb-4">
            <Layout className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Manage your requests, track your progress, and start new orders all
            in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="group relative p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 text-left">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Scan to Order
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              To place a new order, please scan the QR code located on your
              table to access our digital menu.
            </p>
            <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm italic">
              Ready to serve you
            </div>
          </div>

          <Link
            href="/my-orders"
            className="group relative p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300 text-left"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-50 transition-colors duration-300">
              <ClipboardList className="w-6 h-6 text-slate-600 group-hover:text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              View My Orders
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Check the status of your ongoing projects and order history.
            </p>
            <div className="mt-4 flex items-center text-slate-600 group-hover:text-orange-600 font-semibold text-sm">
              Track history →
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            Need assistance?{" "}
            <span className="text-orange-600 font-medium cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSide;
