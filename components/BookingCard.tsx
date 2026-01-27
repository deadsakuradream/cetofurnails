import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BookingCardProps {
    booking: {
        id: string;
        status: string;
        service: {
            name: string;
            price: number;
        };
        design?: {
            name: string;
            price: number;
        } | null;
        timeSlot: {
            date: Date | string;
            startTime: string;
        };
        totalPrice: number;
    };
}

export default function BookingCard({ booking }: BookingCardProps) {
    const date = new Date(booking.timeSlot.date);
    const formattedDate = format(date, 'd MMMM yyyy', { locale: ru });

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-gray-100 text-gray-800',
    };

    const statusLabels = {
        pending: 'Ожидает подтверждения',
        confirmed: 'Подтверждено',
        cancelled: 'Отменено',
        completed: 'Завершено',
    };

    const status = booking.status as keyof typeof statusLabels;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{booking.service.name}</h3>
                    {booking.design && (
                        <p className="text-sm text-primary-600 font-medium">
                            + {booking.design.name}
                        </p>
                    )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100'}`}>
                    {statusLabels[status] || status}
                </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span>⏰</span>
                    <span>{booking.timeSlot.startTime}</span>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-500">Итоговая стоимость:</span>
                <span className="text-lg font-bold text-primary-600">{formatPrice(booking.totalPrice)}</span>
            </div>
        </div>
    );
}
