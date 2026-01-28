'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

const portfolioSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormProps {
  item?: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
    isActive: boolean;
  };
}

export default function PortfolioForm({ item }: PortfolioFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.imageUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: item
      ? {
        title: item.title,
        description: item.description || '',
        isActive: item.isActive,
      }
      : {
        title: '',
        description: '',
        isActive: true,
      },
  });

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Размер файла не должен превышать 10 МБ');
      return;
    }
    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(item?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: PortfolioFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = item?.imageUrl || '';

      // Загружаем изображение, если выбрано новое
      if (imageFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ message: 'Неизвестная ошибка' }));
          throw new Error(errorData.message || 'Ошибка при загрузке изображения');
        }

        const uploadData = await uploadResponse.json();
        if (!uploadData.url) {
          throw new Error('Сервер не вернул URL изображения');
        }
        imageUrl = uploadData.url;
        setIsUploading(false);
      }

      if (!imageUrl && !item) {
        throw new Error('Необходимо загрузить изображение');
      }

      const url = item
        ? `/api/admin/portfolio/${item.id}`
        : '/api/admin/portfolio';
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          imageUrl,
        }),
      });

      if (response.ok) {
        router.push('/admin/portfolio');
        router.refresh();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка при сохранении');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Изображение */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Изображение {!item && '*'}
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
            ${isDragging
              ? 'border-primary-500 bg-primary-50'
              : imagePreview
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
                onError={() => {
                  setError('Не удалось загрузить изображение');
                  setImagePreview(null);
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                  📷 Заменить
                </button>
                {imageFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                  >
                    ✕ Удалить
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 px-6 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-1">
                Перетащите изображение сюда
              </p>
              <p className="text-gray-400 text-sm">
                или нажмите для выбора файла
              </p>
              <p className="text-gray-400 text-xs mt-2">
                PNG, JPG, WEBP до 10 МБ
              </p>
            </div>
          )}
        </div>

        {!item && !imageFile && !imagePreview && (
          <p className="mt-2 text-sm text-red-600">
            Необходимо загрузить изображение
          </p>
        )}
      </div>

      {/* Название */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название работы *
        </label>
        <input
          type="text"
          {...register('title')}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          placeholder="Например: Классический маникюр с дизайном"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Описание */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
          placeholder="Описание работы (необязательно)..."
        />
      </div>

      {/* Активность */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Работа активна (отображается на сайте)
        </label>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Кнопки */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? '📤 Загрузка изображения...' : isSubmitting ? '💾 Сохранение...' : '✅ Сохранить'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
