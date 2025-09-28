'use client';

import Image from "next/image";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: {
    _id: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
  emergencyCount?: number; // Add emergency count prop
}

export const AdminSidebar = ({ activeSection, onSectionChange, user, onLogout, emergencyCount }: AdminSidebarProps) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
   {
    id: 'emergency',
    label: 'Emergency Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="red" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.726-.833-2.496 0L4.318 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    )
  },
  {
    id: 'high-priority',
    label: 'Peer Validated Posts',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="green" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
    {
      id: 'all-posts',
      label: 'All Posts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14" />
        </svg>
      )
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'users',
      label: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 z-40 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Jan Samadhan" width={40} height={40} />
          <div>
            <h1 className="text-xl font-bold">
              Jan Samadhan
            </h1>
            <p className="text-xs text-slate-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
              {/* Show notification count for emergency tab */}
              {item.id === 'emergency' && emergencyCount && emergencyCount > 0 && (
                <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                  {emergencyCount > 99 ? '99+' : emergencyCount}
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg py-2 px-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};