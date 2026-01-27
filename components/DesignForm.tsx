'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

const designSchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
    description: z.string().optional(),
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
            description: '',
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
                : '/api/designs';

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {error && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium">{error}</div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Название
                    </label>
                    <input
                        type="text"
                        {...register('name')}
                        placeholder="Например: Френч"
                        className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600 font-medium">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Описание (необязательно)
                    </label>
                    <textarea
                        {...register('description')}
                        placeholder="Краткое описание дизайна..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Цена (₽)
                    </label>
                    <input
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border-gray-300 shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    />
                    {errors.price && (
                        <p className="mt-1 text-sm text-red-600 font-medium">{errors.price.message}</p>
                    )}
                </div>

                <div className="flex items-center pt-2">
                    <input
                        type="checkbox"
                        {...register('isActive')}
                        id="isActive"
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition"
                    />
                    <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-900 cursor-pointer select-none">
                        Активен (показывать в записи)
                    </label>
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
                <Link
                    href="/admin/designs"
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition text-center"
                >
                    Отмена
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                </button>
            </div>
        </form>
    );
}
