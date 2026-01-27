'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  status: string;
}

interface TimeSlot {
  id: string;
  date: Date | string;
  startTime: string;
  isAvailable: boolean;
  bookings: Booking[];
}

interface TimeSlotActionsProps {
  slot: TimeSlot;
}

export function TimeSlotActions({ slot }: TimeSlotActionsProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlot, setEditedSlot] = useState({
    date: slot.date instanceof Date 
      ? slot.date.toISOString().split('T')[0] 
      : typeof slot.date === 'string'
        ? (slot.date as string).split('T')[0]
        : new Date(slot.date).toISOString().split('T')[0],
    startTime: slot.startTime,
    isAvailable: slot.isAvailable,
  });

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/time-slots/${slot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSlot),
      });

      if (response.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот слот?')) return;

    try {
      const response = await fetch(`/api/admin/time-slots/${slot.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  if (isEditing) {
    return (
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-white p-2 rounded-lg z-10 shadow-lg">
        <input
          type="date"
          value={editedSlot.date}
          onChange={(e) => setEditedSlot({ ...editedSlot, date: e.target.value })}
          className="w-full text-xs p-1 border rounded mb-1"
        />
        <input
          type="time"
          value={editedSlot.startTime}
          onChange={(e) => setEditedSlot({ ...editedSlot, startTime: e.target.value })}
          className="w-full text-xs p-1 border rounded mb-1"
        />
        <label className="flex items-center gap-1 text-xs mb-1">
          <input
            type="checkbox"
            checked={editedSlot.isAvailable}
            onChange={(e) => setEditedSlot({ ...editedSlot, isAvailable: e.target.checked })}
          />
          Доступен
        </label>
        <div className="flex gap-1">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-gray-500 text-white text-xs py-1 rounded hover:bg-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
        title="Редактировать"
      >
        ✏️
      </button>
      {slot.bookings.length === 0 && (
        <button
          onClick={handleDelete}
          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          title="Удалить"
        >
          🗑️
        </button>
      )}
    </div>
  );
}