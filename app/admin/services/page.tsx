import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Service } from '@prisma/client';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

async function getServices(): Promise<Service[]> {
  return await prisma.service.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function ServicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const services = await getServices();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Услуги</h1>
        <Link
          href="/admin/services/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          ➕ Добавить услугу
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service: Service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {service.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPrice(service.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    href={`/admin/services/${service.id}/edit`}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Редактировать
                  </Link>
                  <DeleteButton serviceId={service.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Услуги не добавлены
          </div>
        )}
      </div>
    </div>
  );
}
