'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const timeSlotSchema = z.object({
  date: z.string().min(1, 'Выберите дату'),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Неверный формат времени'),
  isAvailable: z.boolean(),
});

type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

interface TimeSlotFormProps {
  slot?: {
    id: string;
    date: Date;
    startTime: string;
    isAvailable: boolean;
  };
}

export default function TimeSlotForm({ slot }: TimeSlotFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: slot
      ? {
          date: slot.date.toISOString().split('T')[0],
          startTime: slot.startTime,
          isAvailable: slot.isAvailable,
        }
      : {
          date: new Date().toISOString().split('T')[0],
          startTime: '10:00',
          isAvailable: true,
        },
  });

  const onSubmit = async (data: TimeSlotFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = slot
        ? `/api/admin/time-slots/${slot.id}`
        : '/api/admin/time-slots';
      const method = slot ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date),
        }),
      });

      if (response.ok) {
        router.push('/admin/time-slots');
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
          Дата *
        </label>
        <input
          type="date"
          {...register('date')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Время начала (HH:mm) *
          </label>
          <input
            type="time"
            {...register('startTime')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAvailable"
          {...register('isAvailable')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
          Слот доступен для записи
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
