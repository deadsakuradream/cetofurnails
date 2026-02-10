import CategoryForm from '@/components/CategoryForm';

export const dynamic = 'force-dynamic';

export default async function NewCategoryPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Добавить категорию</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <CategoryForm />
            </div>
        </div>
    );
}
