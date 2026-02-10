import PortfolioForm from '@/components/PortfolioForm';

export const dynamic = 'force-dynamic';

export default async function NewPortfolioPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Добавить работу в портфолио</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <PortfolioForm />
      </div>
    </div>
  );
}
