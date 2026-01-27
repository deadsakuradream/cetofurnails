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
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? 'Удаление...' : 'Удалить'}
    </button>
  );
}