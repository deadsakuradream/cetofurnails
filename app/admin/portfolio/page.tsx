import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PortfolioItem } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function getPortfolioItems(): Promise<PortfolioItem[]> {
  return await prisma.portfolioItem.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const items = await getPortfolioItems();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Портфолио</h1>
        <Link
          href="/admin/portfolio/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          ➕ Добавить работу
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item: PortfolioItem) => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.isActive ? 'Активна' : 'Неактивна'}
                </span>
                <Link
                  href={`/admin/portfolio/${item.id}/edit`}
                  className="text-primary-600 hover:text-primary-900 text-sm"
                >
                  Редактировать
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Работы не добавлены
        </div>
      )}
    </div>
  );
}
