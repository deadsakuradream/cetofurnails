'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 safe-area-bottom">
            <div className="max-w-md mx-auto flex justify-around items-center">
                <Link
                    href="/booking"
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/booking') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs font-medium">Записаться</span>
                </Link>

                <Link
                    href="/my-bookings"
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${isActive('/my-bookings') ? 'text-primary-600' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-xs font-medium">Мои записи</span>
                </Link>
            </div>
        </nav>
    );
}
