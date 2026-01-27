'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DesignDeleteButtonProps {
    designId: string;
}

export default function DesignDeleteButton({ designId }: DesignDeleteButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить этот дизайн?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/admin/designs/${designId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.message || 'Ошибка при удалении дизайна');
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
            className="text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition disabled:opacity-50 text-sm font-medium"
        >
            {isDeleting ? '...' : 'Удалить'}
        </button>
    );
}
