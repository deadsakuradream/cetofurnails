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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Категории</h1>
                <Link
                    href="/admin/categories/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
                >
                    + Добавить
                </Link>
            </div>

            {categories.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    Категории не добавлены
                </div>
            ) : (
                <div className="grid gap-4">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Услуг: {category._count.services}
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link
                                        href={`/admin/categories/${category.id}/edit`}
                                        className="text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition text-sm font-medium"
                                    >
                                        Изменить
                                    </Link>
                                    <DeleteButton categoryId={category.id} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
