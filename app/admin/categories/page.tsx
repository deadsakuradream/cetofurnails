import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

async function getCategories() {
    return await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { services: true }
            }
        }
    });
}

export default async function CategoriesPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/admin/login');

    const categories = await getCategories();

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Категории</h1>
                <Link
                    href="/admin/categories/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                    ➕ Добавить категорию
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
                                Количество услуг
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category._count.services}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <Link
                                        href={`/admin/categories/${category.id}/edit`}
                                        className="text-primary-600 hover:text-primary-900 mr-4"
                                    >
                                        Редактировать
                                    </Link>
                                    <DeleteButton categoryId={category.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Категории не добавлены
                    </div>
                )}
            </div>
        </div>
    );
}
