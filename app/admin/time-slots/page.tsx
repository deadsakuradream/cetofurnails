import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import TimeSlotCalendar from '@/components/TimeSlotCalendar';

export const dynamic = 'force-dynamic';

type TimeSlotWithBookings = Prisma.TimeSlotGetPayload<{
  include: {
    bookings: {
      include: {
        service: true;
      };
    };
  };
}>;

async function getTimeSlots(): Promise<TimeSlotWithBookings[]> {
  return await prisma.timeSlot.findMany({
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
    include: {
      bookings: {
        where: {
          status: {
            in: ['pending', 'confirmed'],
          },
        },
        include: {
          service: true,
        },
      },
    },
  });
}

export default async function TimeSlotsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  const slots = await getTimeSlots();

  // Группируем по датам
  const slotsByDate: Record<string, TimeSlotWithBookings[]> = {};
  slots.forEach(slot => {
    // Prisma всегда возвращает Date объекты для DateTime полей
    const dateKey = slot.date.toISOString().split('T')[0];
    if (!slotsByDate[dateKey]) {
      slotsByDate[dateKey] = [];
    }
    slotsByDate[dateKey].push(slot);
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Временные слоты</h1>
      <TimeSlotCalendar slots={slots} />
    </div>
  );
}
