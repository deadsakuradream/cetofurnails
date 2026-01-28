'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    itemId: string;
}

export default function DeleteButton({ itemId }: DeleteButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить эту работу?')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/portfolio/${itemId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                alert('Ошибка при удалении');
            }
        } catch (error) {
            alert('Ошибка при удалении');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
        >
            {isDeleting ? '...' : 'Удалить'}
        </button>
    );
}
