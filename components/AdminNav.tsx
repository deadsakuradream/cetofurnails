'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface AdminNavProps {
  user: {
    name: string;
    email: string;
  };
}

export default function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Главная', exact: true },
    { href: '/admin/services', label: 'Услуги' },
    { href: '/admin/designs', label: 'Дизайны' },
    { href: '/admin/portfolio', label: 'Портфолио' },
    { href: '/admin/time-slots', label: 'Временные слоты' },
    { href: '/admin/bookings', label: 'Записи' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-primary-600">
              Админ панель
            </Link>
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => {
                const isActive =
                  item.exact
                    ? pathname === item.href
                    : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition"
            >
              Выйти
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive =
              item.exact ? pathname === item.href : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
