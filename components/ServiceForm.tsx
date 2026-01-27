'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  price: z.number().min(0, 'Цена должна быть положительной'),
  isActive: z.boolean(),
  categoryId: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
    categoryId: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export default function ServiceForm({ service, categories }: ServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
        name: service.name,
        description: service.description || '',
        price: service.price,
        isActive: service.isActive,
        categoryId: service.categoryId || '',
      }
      : {
        name: '',
        description: '',
        price: 0,
        isActive: true,
        categoryId: '',
      },
  });

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = service
        ? `/api/admin/services/${service.id}`
        : '/api/admin/services';
      const method = service ? 'PUT' : 'POST';

      const body = {
        ...data,
        categoryId: data.categoryId === '' ? null : data.categoryId,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        router.push('/admin/services');
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
          Название услуги *
        </label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Например: Классический маникюр"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категория
        </label>
        <select
          {...register('categoryId')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Без категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Описание услуги..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена (руб.) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Услуга активна (отображается на сайте)
        </label>
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
