'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    categoryId: string;
}

export default function DeleteButton({ categoryId }: DeleteButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка при удалении категории');
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
