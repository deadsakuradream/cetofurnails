'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatPrice } from '@/lib/utils';
import { formatPhoneNumber, getPhoneDigits, validatePhoneNumber } from '@/lib/phoneMask';
import { Service, Category, TimeSlot, Design } from '@prisma/client';
import TelegramLoginButton from './TelegramLoginButton';

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Выберите услугу'),
  designId: z.string().optional(),
  timeSlotId: z.string().min(1, 'Выберите время'),
  clientName: z.string().min(2, 'Введите имя'),
  clientPhone: z.string().min(10, 'Введите корректный номер телефона'),
  clientTelegram: z.string().optional(),
  telegramUserId: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

type ServiceWithCategory = Service & { category: Category | null };

interface BookingFormProps {
  services: ServiceWithCategory[];
  designs: Design[];
  timeSlots: Array<{
    id: string;
    date: string | Date; // Serialized date can be string
    startTime: string;
  }>;
}

interface ServiceCardProps {
  service: ServiceWithCategory;
  isSelected: boolean;
  onSelect: () => void;
}

function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl cursor-pointer transition-all duration-300
        border-2 hover:scale-[1.02] hover:shadow-lg
        ${isSelected
          ? 'border-primary-600 bg-primary-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-primary-300'
        }
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-900">{service.name}</h3>
        {isSelected && (
          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
            Выбрано
          </span>
        )}
      </div>
      {service.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
      )}
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-primary-600">
          {formatPrice(service.price)}
        </span>
      </div>
    </div>
  );
}

// ... Calendar component remains the same, assuming it is standalone or I need to include it.
// To avoid rewriting the entire huge file and potentially breaking Calendar, I will try to use multi_replace only for main logic if possible.
// BUT, I need to change imports and interfaces heavily.
// I'll rewrite the whole component to be safe as I am changing Schema AND Logic.
// I will copy Calendar code from previous Step 37.

interface CalendarProps {
  slots: Array<{
    id: string;
    date: Date | string;
    startTime: string;
  }>;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
}

function Calendar({ slots, selectedSlotId, onSelectSlot }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group slots by date
  const slotsByDate: Record<string, typeof slots> = {};
  slots.forEach(slot => {
    const dateKey = slot.date instanceof Date
      ? slot.date.toISOString().split('T')[0]
      : (slot.date as string).split('T')[0];
    if (!slotsByDate[dateKey]) {
      slotsByDate[dateKey] = [];
    }
    slotsByDate[dateKey].push(slot);
  });

  const availableDates = Object.keys(slotsByDate).filter(dateKey => {
    const slotDate = new Date(dateKey);
    return slotDate >= today;
  }).sort();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateAvailable = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return availableDates.includes(dateKey);
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 rounded-lg transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-sm text-gray-900 capitalize">{monthName}</span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 rounded-lg transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 bg-gray-100 text-center py-1.5 text-xs font-medium text-gray-600">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 p-2">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="aspect-square" />;

          const dateKey = day.toISOString().split('T')[0];
          const available = isDateAvailable(day);
          const slotsCount = slotsByDate[dateKey]?.length || 0;
          const isSelected = selectedDate?.toISOString().split('T')[0] === dateKey;
          const isPast = isDatePast(day);

          return (
            <button
              key={dateKey}
              onClick={() => available && setSelectedDate(day)}
              disabled={!available}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium
                transition-all duration-200
                ${!available || isPast
                  ? 'text-gray-300 cursor-not-allowed'
                  : isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'hover:bg-primary-100 text-gray-700'
                }
              `}
            >
              <span className="text-sm">{day.getDate()}</span>
              {available && !isPast && slotsCount > 0 && (
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white' : 'text-primary-600'}`}>
                  {slotsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && slotsByDate[selectedDate.toISOString().split('T')[0]] && (
        <div className="border-t p-3 bg-gray-50">
          <h4 className="font-medium text-sm text-gray-900 mb-2">
            {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </h4>
          <div className="grid grid-cols-4 gap-1.5">
            {slotsByDate[selectedDate.toISOString().split('T')[0]].map((slot: { id: string; startTime: string }) => (
              <button
                key={slot.id}
                onClick={() => onSelectSlot(slot.id)}
                className={`
                  px-2 py-1.5 rounded text-xs font-medium transition-all duration-200
                  ${selectedSlotId === slot.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600'
                  }
                `}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingForm({ services, designs, timeSlots }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [userInteracted, setUserInteracted] = useState(false); // Защита от автоматической отправки

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const categoryName = service.category?.name || 'Другое';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, ServiceWithCategory[]>);

  const sortedCategories = Object.keys(groupedServices).sort((a, b) => {
    if (a === 'Другое') return 1;
    if (b === 'Другое') return -1;
    return a.localeCompare(b);
  });

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Telegram Web App автозаполнение (при открытии через бота)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp;

      if (tg?.initDataUnsafe?.user) {
        const user = tg.initDataUnsafe.user;

        // Устанавливаем telegramUser для отображения статуса авторизации
        setTelegramUser(user);

        // Сохраняем Telegram ID
        if (user.id) {
          setValue('telegramUserId', user.id.toString());

          // Запрашиваем сохраненные данные пользователя (номер телефона)
          fetch(`/api/telegram/user?telegramId=${user.id}`)
            .then(res => res.json())
            .then(data => {
              if (data.phone) {
                const formatted = data.phone.startsWith('+') ? data.phone : formatPhoneNumber(data.phone);
                setValue('clientPhone', formatted);
              }
              if (data.firstName) {
                const fullName = data.firstName + (data.lastName ? ` ${data.lastName}` : '');
                setValue('clientName', fullName);
              }
            })
            .catch(err => console.error('Error fetching saved user data:', err));
        }

        // Автозаполнение Telegram username
        if (user.username) {
          setValue('clientTelegram', user.username);
        }

        // Автозаполнение телефона из контакта (если есть в initData)
        if (tg.initDataUnsafe.contact?.phone_number) {
          const phone = tg.initDataUnsafe.contact.phone_number;
          const formatted = phone.startsWith('+') ? phone : formatPhoneNumber(phone);
          setValue('clientPhone', formatted);
        }

        // Автозаполнение имени из initData
        if (tg.initDataUnsafe.contact?.first_name) {
          const fullName = tg.initDataUnsafe.contact.first_name +
            (tg.initDataUnsafe.contact.last_name ? ` ${tg.initDataUnsafe.contact.last_name}` : '');
          setValue('clientName', fullName);
        } else if (user.first_name) {
          const fullName = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
          setValue('clientName', fullName);
        }
      }
    }
  }, [setValue]);

  // Обработчик Telegram Login
  const handleTelegramAuth = (user: any) => {
    setTelegramUser(user);

    // Автозаполнение имени
    const fullName = `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}`;
    setValue('clientName', fullName);

    // Автозаполнение Telegram username
    if (user.username) {
      setValue('clientTelegram', user.username);
    }
  };

  useEffect(() => {
    if (selectedService) setValue('serviceId', selectedService);
    if (selectedDesign) setValue('designId', selectedDesign);
    if (selectedSlotId) setValue('timeSlotId', selectedSlotId);
  }, [selectedService, selectedDesign, selectedSlotId, setValue]);

  const onSubmit = async (data: BookingFormData) => {
    // Защита от автоматической отправки - требуем явного взаимодействия пользователя
    if (!userInteracted) {
      console.log('Blocked auto-submit: user has not interacted with the form');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setSubmitStatus('success');
        reset();
        setSelectedService('');
        setSelectedDesign('');
        setSelectedSlotId(null);
        setUserInteracted(false); // Сбрасываем флаг после успешной отправки
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Ошибка при создании записи');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedDesignData = designs.find(d => d.id === selectedDesign);
  const totalPrice = (selectedServiceData?.price || 0) + (selectedDesignData?.price || 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step 1: Service Selection */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
          Выберите услугу
        </h3>

        <div className="space-y-4">
          {sortedCategories.length > 0 ? (
            sortedCategories.map(category => (
              <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                >
                  <h4 className="font-semibold text-gray-900">{category}</h4>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${expandedCategories.includes(category) ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedCategories.includes(category) && (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200">
                    {groupedServices[category].map(service => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        isSelected={selectedService === service.id}
                        onSelect={() => setSelectedService(service.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-medium">Нет доступных услуг.</p>
            </div>
          )}
        </div>

        {errors.serviceId && (
          <p className="mt-2 text-sm text-red-600">{errors.serviceId.message}</p>
        )}
      </div>

      {/* Step 2: Design Selection (Optional) */}
      {selectedService && (
        <div className="animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
            Выберите дизайн (необязательно)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option "No Design" */}
            <div
              onClick={() => setSelectedDesign('')}
              className={`
                p-4 rounded-xl cursor-pointer transition-all duration-300
                border-2 hover:scale-[1.02] hover:shadow-lg
                ${!selectedDesign
                  ? 'border-primary-600 bg-primary-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-primary-300'
                }
              `}
            >
              <h4 className="font-bold text-gray-900">Без дизайна</h4>
              <p className="text-sm text-gray-500">Только маникюр</p>
            </div>

            {designs.map(design => (
              <div
                key={design.id}
                onClick={() => setSelectedDesign(design.id)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all duration-300
                  border-2 hover:scale-[1.02] hover:shadow-lg
                  ${selectedDesign === design.id
                    ? 'border-primary-600 bg-primary-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                  }
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-gray-900">{design.name}</h4>
                  <span className="font-bold text-primary-600">{formatPrice(design.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {selectedService && (
        <div className="animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
            Выберите дату и время
          </h3>
          <Calendar
            slots={timeSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
          />
          {errors.timeSlotId && (
            <p className="mt-2 text-sm text-red-600">{errors.timeSlotId.message}</p>
          )}
        </div>
      )}

      {/* Step 4: Contact Info */}
      {selectedSlotId && (
        <div className="animate-fadeIn">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
            Ваши контакты
          </h3>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Ваша запись:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>💅 <strong>Услуга:</strong> {selectedServiceData?.name}</p>
              {selectedDesignData && (
                <p>🎨 <strong>Дизайн:</strong> {selectedDesignData.name}</p>
              )}
              <p>💰 <strong>Итого:</strong> {formatPrice(totalPrice)}</p>
              <p>⏰ <strong>Время:</strong> {timeSlots.find(s => s.id === selectedSlotId)?.startTime}</p>
            </div>
          </div>

          {/* Telegram Login */}
          {!telegramUser && process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 mb-3">
                💡 Войдите через Telegram, чтобы автоматически заполнить ваши данные
              </p>
              <TelegramLoginButton
                botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
                onAuth={handleTelegramAuth}
                buttonSize="medium"
                cornerRadius={8}
              />
            </div>
          )}

          {telegramUser && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Вы вошли как {telegramUser.first_name}
                </p>
                <p className="text-xs text-green-700">
                  Данные автоматически заполнены
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ваше имя *</label>
              <input
                type="text"
                {...register('clientName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Иван Иванов"
              />
              {errors.clientName && <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон *</label>
              <input
                type="tel"
                {...register('clientPhone', {
                  onChange: (e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    e.target.value = formatted;
                    setValue('clientPhone', formatted, { shouldValidate: true });
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+7 (999) 123-45-67"
              />
              {errors.clientPhone && <p className="mt-1 text-sm text-red-600">{errors.clientPhone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telegram (необязательно)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  {...register('clientTelegram')}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Комментарий (необязательно)</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Дополнительная информация..."
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setUserInteracted(true)}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? '⏳ Отправка...' : '✅ Записаться'}
            </button>
          </div>
        </div>
      )}

      {submitStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-xl">
          <p className="font-semibold">Запись успешно создана!</p>
          <p className="text-sm">Мы свяжемся с вами для подтверждения.</p>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-xl">
          <p className="font-semibold">Произошла ошибка</p>
          <p className="text-sm">Пожалуйста, попробуйте снова или свяжитесь с нами.</p>
        </div>
      )}
    </form>
  );
}