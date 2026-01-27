import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DesignDeleteButton from './DesignDeleteButton';

export const dynamic = 'force-dynamic';

interface Design {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
}

export default async function DesignsPage() {
    const designs = await prisma.design.findMany({
        orderBy: { createdAt: 'desc' },
    }) as Design[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Дизайны</h1>
                <Link
                    href="/admin/designs/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
                >
                    + Добавить
                </Link>
            </div>

            {designs.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                    Дизайны не добавлены
                </div>
            ) : (
                <div className="grid gap-4">
                    {designs.map((design) => (
                        <div
                            key={design.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-gray-900">{design.name}</h3>
                                        <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${design.isActive
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}
                                        >
                                            {design.isActive ? 'Активен' : 'Скрыт'}
                                        </span>
                                    </div>
                                    {design.description && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{design.description}</p>
                                    )}
                                    <p className="text-sm font-medium text-primary-600 mt-1">{design.price} ₽</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Link
                                        href={`/admin/designs/${design.id}/edit`}
                                        className="text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition text-sm font-medium"
                                    >
                                        Изменить
                                    </Link>
                                    <DesignDeleteButton designId={design.id} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
