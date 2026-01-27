'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
  serviceId: string;
}

export default function DeleteButton({ serviceId }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/services/${serviceId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Ошибка при удалении услуги');
      }
    } catch (error) {
      alert('Произошла ошибка');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition disabled:opacity-50"
      title="Удалить"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="hidden sm:inline">{isDeleting ? 'Удаление...' : 'Удалить'}</span>
    </button>
  );
}