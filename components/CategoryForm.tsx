'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, 'Название обязательно'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
    category?: {
        id: string;
        name: string;
    };
}

export default function CategoryForm({ category }: CategoryFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: category
            ? {
                name: category.name,
            }
            : {
                name: '',
            },
    });

    const onSubmit = async (data: CategoryFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const url = category
                ? `/api/admin/categories/${category.id}`
                : '/api/admin/categories';
            const method = category ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                router.push('/admin/categories');
                router.refresh();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Ошибка при сохранении');
            }
        } catch (error) {
            setError('Произошла ошибка');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название категории *
                </label>
                <input
                    type="text"
                    {...register('name')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Например: Маникюр"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                    Отмена
                </button>
            </div>
        </form>
    );
}
