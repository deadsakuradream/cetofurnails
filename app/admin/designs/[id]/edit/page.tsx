import { prisma } from '@/lib/prisma';
import DesignForm from '@/components/DesignForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditDesignPage({ params }: PageProps) {
    const { id } = await params;

    const design = await prisma.design.findUnique({
        where: { id },
    });

    if (!design) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Редактировать дизайн</h1>
            <DesignForm initialData={design} isEditing />
        </div>
    );
}
