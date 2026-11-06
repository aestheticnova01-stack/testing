'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Package, Store, Settings, FileText, LogOut, Users } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: FileText },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Store },
    { name: 'Homepage', href: '/admin/homepage', icon: LayoutDashboard },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  if (!user) {
    return null; // middleware redirects to /admin/login anyway
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border">
          <span className="font-bold text-xl tracking-tight">
            <span className="text-indigo-600">AESTHETIC</span>ADMIN
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-gray-100 rounded"
          >
            <span className="sr-only">Close menu</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-600 transition"
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 py-6 border-t border-border">
          <div className="text-xs text-gray-500 mb-3">Signed in as</div>
          <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-3 w-full py-2 px-3 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <main className="px-6 py-8 md:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
