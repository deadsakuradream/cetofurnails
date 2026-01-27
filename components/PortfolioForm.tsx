'use client';

import { useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.imageUrl || null
  );

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PortfolioFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = item?.imageUrl || '';

      // Загружаем изображение, если выбрано новое
      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append('image', imageFile);

          const uploadResponse = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({ message: 'Неизвестная ошибка' }));
            console.error('Upload error:', errorData);
            
            // Если это ошибка файловой системы, предлагаем использовать URL
            if (errorData.error === 'File system is read-only on Vercel') {
              throw new Error('Загрузка файлов не поддерживается на Vercel. Пожалуйста, используйте URL изображения (например, загрузите на Imgur, Cloudinary или другой хостинг изображений).');
            }
            
            throw new Error(errorData.message || 'Ошибка при загрузке изображения');
          }

          const uploadData = await uploadResponse.json();
          if (!uploadData.url) {
            throw new Error('Сервер не вернул URL изображения');
          }
          imageUrl = uploadData.url;
        } catch (uploadError) {
          // Если загрузка не удалась, но есть preview (URL), используем его
          if (imagePreview && imagePreview.startsWith('http')) {
            console.warn('File upload failed, using preview URL instead');
            imageUrl = imagePreview;
          } else {
            throw uploadError;
          }
        }
      } else if (imagePreview && imagePreview.startsWith('http')) {
        // Если указан URL напрямую
        imageUrl = imagePreview;
      }

      if (!imageUrl && !item) {
        throw new Error('Необходимо загрузить изображение или указать URL');
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название работы *
        </label>
        <input
          type="text"
          {...register('title')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Например: Классический маникюр с дизайном"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
          placeholder="Описание работы..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Изображение {!item && '*'}
        </label>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Загрузить файл (не работает на Vercel - используйте URL)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-500">или</div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Вставить URL изображения
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              onChange={(e) => {
                const url = e.target.value.trim();
                if (url) {
                  setImagePreview(url);
                  setImageFile(null);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Вставьте прямую ссылку на изображение (например, из Imgur, Cloudinary, или другого хостинга)
            </p>
          </div>
        </div>
        {imagePreview && (
          <div className="mt-4 relative w-full max-w-md aspect-square rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {
                setError('Не удалось загрузить изображение. Проверьте URL.');
                setImagePreview(null);
              }}
            />
          </div>
        )}
        {!item && !imageFile && !imagePreview && (
          <p className="mt-1 text-sm text-red-600">
            Необходимо загрузить изображение или указать URL
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Работа активна (отображается на сайте)
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
