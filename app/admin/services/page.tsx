import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Service, Category } from '@prisma/client';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

type ServiceWithCategory = Service & { category: Category | null };

async function getServices() {
  return await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
}

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function ServicesPage() {
  const [services, categories] = await Promise.all([
    getServices(),
    getCategories(),
  ]);

  // Группировка услуг по категориям
  const groupedServices = services.reduce((acc, service) => {
    const categoryName = service.category?.name || 'Без категории';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, ServiceWithCategory[]>);

  // Сортировка категорий
  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    if (a === 'Без категории') return 1;
    if (b === 'Без категории') return -1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Услуги</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/categories/new"
            className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
          >
            📂 Добавить категорию
          </Link>
          <Link
            href="/admin/services/new"
            className="bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm sm:text-base"
          >
            ➕ Добавить услугу
          </Link>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Услуги не добавлены
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCategories.map((categoryName) => (
            <details key={categoryName} className="bg-white rounded-lg shadow overflow-hidden" open>
              <summary className="px-4 sm:px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer font-semibold text-gray-900 flex justify-between items-center">
                <span className="text-base sm:text-lg">{categoryName}</span>
                <span className="text-sm text-gray-500">
                  {groupedServices[categoryName].length} {groupedServices[categoryName].length === 1 ? 'услуга' : 'услуг'}
                </span>
              </summary>

              <div className="divide-y divide-gray-200">
                {groupedServices[categoryName].map((service) => (
                  <div key={service.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Информация об услуге */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {service.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${service.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {service.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
                            {service.description}
                          </p>
                        )}
                        <p className="text-base sm:text-lg font-bold text-primary-600">
                          {formatPrice(service.price)}
                        </p>
                      </div>

                      {/* Действия */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Link
                          href={`/admin/services/${service.id}/edit`}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded transition"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden sm:inline">Редактировать</span>
                        </Link>
                        <DeleteButton serviceId={service.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
