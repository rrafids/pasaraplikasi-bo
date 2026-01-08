'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  TagIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { api, User } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    // In a real app, you'd fetch user data here
  }, [router]);

  const handleLogout = () => {
    api.clearToken();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'Users', href: '/dashboard/users', icon: UserGroupIcon },
    { name: 'Products', href: '/dashboard/products', icon: ArchiveBoxIcon },
    { name: 'Categories', href: '/dashboard/categories', icon: TagIcon },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon },
  ];

  return (
    <div className="h-screen bg-slate-100 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/80 px-4 py-6 shadow-sm backdrop-blur md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            TA
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              tukuaplikasi.com
            </div>
            <div className="text-xs text-slate-500">Admin Panel</div>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm font-medium'
                    : 'text-slate-600 hover:bg-slate-100 font-normal'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
