import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const { sidebarCollapsed } = useSelector((state) => state.ui);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Shell with Dynamic Left Margin */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 sm:lg:pl-72'
        }`}
      >
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
