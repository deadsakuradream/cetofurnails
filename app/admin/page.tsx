import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getStats() {
  try {
    const [services, portfolioItems, bookings, timeSlots, categories] = await Promise.all([
      prisma.service.count(),
      prisma.portfolioItem.count(),
      prisma.booking.count(),
      prisma.timeSlot.count({
        where: {
          isAvailable: true,
          date: {
            gte: new Date(),
          },
        },
      }),
      prisma.category.count(),
    ]);

    return { services, portfolioItems, bookings, timeSlots, categories };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { services: 0, portfolioItems: 0, bookings: 0, timeSlots: 0, categories: 0 };
  }
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  let stats;
  try {
    stats = await getStats();
  } catch (error) {
    console.error('Dashboard error:', error);
    stats = { services: 0, portfolioItems: 0, bookings: 0, timeSlots: 0, categories: 0 };
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Услуги</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.services}</p>
          <Link
            href="/admin/services"
            className="text-sm text-primary-600 hover:underline mt-2 inline-block"
          >
            Управление →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Портфолио</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.portfolioItems}</p>
          <Link
            href="/admin/portfolio"
            className="text-sm text-primary-600 hover:underline mt-2 inline-block"
          >
            Управление →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Записи</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.bookings}</p>
          <Link
            href="/admin/bookings"
            className="text-sm text-primary-600 hover:underline mt-2 inline-block"
          >
            Управление →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Категории</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.categories}</p>
          <Link
            href="/admin/categories"
            className="text-sm text-primary-600 hover:underline mt-2 inline-block"
          >
            Управление →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Доступные слоты</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.timeSlots}</p>
          <Link
            href="/admin/time-slots"
            className="text-sm text-primary-600 hover:underline mt-2 inline-block"
          >
            Управление →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/services/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            ➕ Добавить услугу
          </Link>
          <Link
            href="/admin/portfolio/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            📸 Добавить в портфолио
          </Link>
          <Link
            href="/admin/time-slots/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            ⏰ Добавить временной слот
          </Link>
          <Link
            href="/admin/categories/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-center"
          >
            📂 Добавить категорию
          </Link>
        </div>
      </div>
    </div>
  );
}
