import ServiceForm from '@/components/ServiceForm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NewServicePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Добавить услугу</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ServiceForm categories={categories} />
      </div>
    </div>
  );
}
