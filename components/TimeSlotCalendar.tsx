'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { formatPhoneNumber } from '@/lib/phoneMask';

interface TimeSlot {
  id: string;
  date: Date | string;
  startTime: string;
  isAvailable: boolean;
  bookings: Array<{
    id: string;
    status: string;
    clientName: string;
    clientPhone: string;
    clientTelegram: string | null;
    service: {
      id: string;
      name: string;
    };
  }>;
}

interface TimeSlotCalendarProps {
  slots: TimeSlot[];
}

export default function TimeSlotCalendar({ slots: initialSlots }: TimeSlotCalendarProps) {
  const router = useRouter();
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Обновляем слоты при изменении пропсов
  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  // Получаем текущий месяц и год
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Группируем слоты по датам
  const slotsByDate: Record<string, TimeSlot[]> = {};
  slots.forEach(slot => {
    const dateKey = slot.date instanceof Date 
      ? slot.date.toISOString().split('T')[0] 
      : typeof slot.date === 'string' 
        ? slot.date.split('T')[0]
        : new Date(slot.date).toISOString().split('T')[0];
    if (!slotsByDate[dateKey]) {
      slotsByDate[dateKey] = [];
    }
    slotsByDate[dateKey].push(slot);
  });

  // Генерируем календарь
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    // Показываем список существующих слотов, а не сразу форму создания
    setShowTimePicker(false);
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, '10:00']);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, time: string) => {
    const updated = [...timeSlots];
    updated[index] = time;
    setTimeSlots(updated);
  };

  const handleCreateSlots = async () => {
    if (!selectedDate || timeSlots.length === 0) return;

    setIsCreating(true);
    try {
      // Создаем все слоты параллельно
      const promises = timeSlots.map(time => 
        fetch('/api/admin/time-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date(selectedDate),
            startTime: time,
            isAvailable: true,
          }),
        })
      );

      const results = await Promise.all(promises);
      const errors = results.filter(r => !r.ok);
      
      if (errors.length > 0) {
        throw new Error('Некоторые слоты не удалось создать');
      }
      
      // Обновляем список слотов через refresh
      router.refresh();
      
      // Закрываем модальное окно
      setShowTimePicker(false);
      setSelectedDate(null);
      setTimeSlots([]);
    } catch (error) {
      console.error('Error creating slots:', error);
      alert('Ошибка при создании слотов');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот слот?')) return;

    try {
      const response = await fetch(`/api/admin/time-slots/${slotId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Удаляем слот из локального состояния
        const updatedSlots = slots.filter(s => s.id !== slotId);
        setSlots(updatedSlots);
        // Обновляем данные с сервера
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка при удалении' }));
        alert(errorData.message || 'Ошибка при удалении слота');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Ошибка при удалении слота');
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getSlotsForDay = (day: number): TimeSlot[] => {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().split('T')[0];
    return slotsByDate[dateKey] || [];
  };

  const isPastDate = (day: number): boolean => {
    const date = new Date(currentYear, currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      {/* Календарь */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <button
            onClick={prevMonth}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition text-lg sm:text-xl"
          >
            ←
          </button>
          <h2 className="text-base sm:text-xl font-bold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition text-lg sm:text-xl"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-600 py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const daySlots = getSlotsForDay(day);
            const isPast = isPastDate(day);
            const isToday = 
              day === new Date().getDate() &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear();
            const availableCount = daySlots.filter(s => s.isAvailable && s.bookings.length === 0).length;
            const bookedCount = daySlots.filter(s => s.bookings.length > 0).length;

            return (
              <button
                key={day}
                onClick={() => !isPast && handleDateClick(day)}
                disabled={isPast}
                className={`
                  aspect-square p-1 sm:p-2 rounded-lg border-2 transition relative
                  ${isPast 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : isToday
                    ? 'bg-primary-50 border-primary-500 text-primary-900 hover:bg-primary-100'
                    : 'bg-white border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                  }
                `}
              >
                <div className="text-xs sm:text-sm font-medium">{day}</div>
                {daySlots.length > 0 && (
                  <div className="mt-0.5 sm:mt-1 flex flex-col gap-0.5">
                    {/* На мобильных показываем только счетчики */}
                    <div className="flex gap-1 flex-wrap sm:hidden">
                      {availableCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" title={`${availableCount} доступных`} />
                      )}
                      {bookedCount > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" title={`${bookedCount} забронированных`} />
                      )}
                      <span className="text-[8px] text-gray-500">{daySlots.length}</span>
                    </div>
                    {/* На десктопе показываем время */}
                    <div className="hidden sm:block space-y-0.5">
                      {daySlots.slice(0, 2).map(slot => (
                        <div
                          key={slot.id}
                          className={`
                            truncate px-1 py-0.5 rounded text-[10px]
                            ${slot.isAvailable && slot.bookings.length === 0
                              ? 'bg-green-100 text-green-700'
                              : slot.bookings.length > 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                            }
                          `}
                        >
                          {slot.startTime}
                        </div>
                      ))}
                      {daySlots.length > 2 && (
                        <div className="text-[10px] text-gray-500">+{daySlots.length - 2}</div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Модальное окно для создания слотов */}
      {showTimePicker && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
              Создать слоты на {formatDate(selectedDate)}
            </h3>

            <div className="space-y-2 sm:space-y-3 mb-4 max-h-64 overflow-y-auto">
              {timeSlots.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeTimeSlot(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm sm:text-base"
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={addTimeSlot}
                className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-gray-200 transition"
              >
                + Добавить время
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCreateSlots}
                disabled={isCreating || timeSlots.length === 0}
                className="flex-1 bg-primary-600 text-white px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Создание...' : `Создать ${timeSlots.length} слотов`}
              </button>
              <button
                onClick={() => {
                  setShowTimePicker(false);
                  setTimeSlots([]);
                }}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список слотов для выбранного дня */}
      {selectedDate && !showTimePicker && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Слоты на {formatDate(selectedDate)}
            </h3>
            <button
              onClick={() => {
                setShowTimePicker(true);
                setTimeSlots([]);
              }}
              className="w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              + Добавить слоты
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {getSlotsForDay(selectedDate.getDate()).map((slot) => {
              const booking = slot.bookings[0]; // Берем первую бронь (обычно одна)
              return (
                <div
                  key={slot.id}
                  className={`p-3 sm:p-4 rounded-lg border relative group ${
                    slot.isAvailable && slot.bookings.length === 0
                      ? 'bg-green-50 border-green-200'
                      : slot.bookings.length > 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm sm:text-base font-medium text-gray-700">
                      {slot.startTime}
                    </div>
                    {slot.bookings.length === 0 && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  
                  {booking ? (
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="text-red-700 font-medium">
                        Забронирован
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Клиент:</span> {booking.clientName}
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Телефон:</span>{' '}
                        <a 
                          href={`tel:+${booking.clientPhone}`}
                          className="text-primary-600 hover:underline"
                        >
                          {formatPhoneNumber(booking.clientPhone)}
                        </a>
                      </div>
                      {booking.clientTelegram && (
                        <div className="text-gray-700">
                          <span className="font-medium">Telegram:</span>{' '}
                          <a
                            href={`https://t.me/${booking.clientTelegram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#229ED9] hover:underline"
                          >
                            @{booking.clientTelegram.replace('@', '')}
                          </a>
                        </div>
                      )}
                      <div className="text-gray-700">
                        <span className="font-medium">Услуга:</span> {booking.service.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      {slot.isAvailable ? 'Доступен' : 'Недоступен'}
                    </div>
                  )}
                </div>
              );
            })}
            {getSlotsForDay(selectedDate.getDate()).length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-4 text-sm sm:text-base">
                Нет слотов на этот день. Нажмите &quot;Добавить слоты&quot; чтобы создать.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
