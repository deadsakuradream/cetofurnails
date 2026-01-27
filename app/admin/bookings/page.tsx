import { prisma } from '@/lib/prisma';
import { formatDate, formatPrice } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    service: true;
    timeSlot: true;
  };
}>;

async function getBookings(): Promise<BookingWithRelations[]> {
  return await prisma.booking.findMany({
    include: {
      service: true,
      timeSlot: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function BookingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const bookings = await getBookings();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Записи клиентов</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Услуга
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата и время
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Создано
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => {
                // Извлекаем username из clientTelegram (может быть в формате @username или просто username)
                const telegramUsername = booking.clientTelegram 
                  ? booking.clientTelegram.startsWith('@') 
                    ? booking.clientTelegram.substring(1) 
                    : booking.clientTelegram
                  : null;
                
                return (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.clientName}
                    </div>
                    <div className="text-sm text-gray-500">{booking.clientPhone}</div>
                    {telegramUsername && (
                      <div className="text-sm mt-1">
                        <a
                          href={`https://t.me/${telegramUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#229ED9] hover:underline flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          @{telegramUsername}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.service.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(booking.service.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(booking.timeSlot.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.timeSlot.startTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {booking.status === 'pending'
                        ? 'Ожидает'
                        : booking.status === 'confirmed'
                        ? 'Подтверждена'
                        : 'Отменена'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <DeleteButton bookingId={booking.id} />
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Записи отсутствуют
          </div>
        )}
      </div>
    </div>
  );
}
