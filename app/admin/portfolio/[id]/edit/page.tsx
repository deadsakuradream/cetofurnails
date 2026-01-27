import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import PortfolioForm from '@/components/PortfolioForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getPortfolioItem(id: string) {
  return await prisma.portfolioItem.findUnique({
    where: { id },
  });
}

export default async function EditPortfolioPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const item = await getPortfolioItem(params.id);

  if (!item) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Редактировать работу</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <PortfolioForm item={item} />
      </div>
    </div>
  );
}
