import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ServiceForm from '@/components/ServiceForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getService(id: string) {
  return await prisma.service.findUnique({
    where: { id },
  });
}

export default async function EditServicePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const [service, categories] = await Promise.all([
    getService(params.id),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!service) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Редактировать услугу</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ServiceForm service={service} categories={categories} />
      </div>
    </div>
  );
}
