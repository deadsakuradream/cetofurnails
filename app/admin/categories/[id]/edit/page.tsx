import { prisma } from '@/lib/prisma';
import CategoryForm from '@/components/CategoryForm';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface EditCategoryPageProps {
    params: {
        id: string;
    };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    const user = await getCurrentUser();
    if (!user) redirect('/admin/login');

    const category = await prisma.category.findUnique({
        where: { id: params.id },
    });

    if (!category) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Редактировать категорию</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <CategoryForm category={category} />
            </div>
        </div>
    );
}
