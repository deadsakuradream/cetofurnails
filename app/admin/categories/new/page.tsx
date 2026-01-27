import CategoryForm from '@/components/CategoryForm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function NewCategoryPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/admin/login');

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Добавить категорию</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <CategoryForm />
            </div>
        </div>
    );
}
