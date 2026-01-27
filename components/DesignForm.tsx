'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const designSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    price: z.number().min(0, 'Цена не может быть отрицательной'),
    isActive: z.boolean(),
});

type DesignFormData = z.infer<typeof designSchema>;

interface DesignFormProps {
    initialData?: DesignFormData & { id: string };
    isEditing?: boolean;
}

export default function DesignForm({ initialData, isEditing = false }: DesignFormProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<DesignFormData>({
        resolver: zodResolver(designSchema),
        defaultValues: initialData || {
            name: '',
            price: 0,
            isActive: true,
        },
    });

    const onSubmit = async (data: DesignFormData) => {
        try {
            setIsSubmitting(true);
            setError('');

            const url = isEditing
                ? `/api/admin/designs/${initialData?.id}`
                : '/api/designs'; // POST to public endpoint for creation (or consistent admin endpoint)

            // NOTE: Using /api/designs for creation as implemented previously, need admin endpoint for updates
            // Actually let's create api/admin/designs/[id] route as well for consistency

            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                throw new Error('Ошибка при сохранении');
            }

            router.push('/admin/designs');
            router.refresh();
        } catch (err) {
            setError('Произошла ошибка при сохранении');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название
                </label>
                <input
                    type="text"
                    {...register('name')}
                    className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена (₽)
                </label>
                <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    {...register('isActive')}
                    id="isActive"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Активен (показывать в записи)
                </label>
            </div>

            <div className="flex gap-4">
                <Link
                    href="/admin/designs"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                    Отмена
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </form>
    );
}
