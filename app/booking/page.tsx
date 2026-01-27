import { prisma } from '@/lib/prisma';
import { formatPrice, formatDate } from '@/lib/utils';
import BookingForm from '@/components/BookingForm';
import Navigation from '@/components/Navigation';


export const dynamic = 'force-dynamic';
export const revalidate = 20;

async function getServices() {
  return await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
}

async function getAvailableTimeSlots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const slots = await prisma.timeSlot.findMany({
    where: {
      isAvailable: true,
      date: {
        gte: today,
      },
    },
    include: {
      bookings: {
        where: {
          status: {
            in: ['pending', 'confirmed'],
          },
        },
      },
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' },
    ],
  });

  // Фильтруем слоты, которые уже забронированы
  return slots.filter(slot => slot.bookings.length === 0);
}

async function getDesigns() {
  return await prisma.design.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export default async function BookingPage() {
  const services = await getServices();
  const designs = await getDesigns();
  const timeSlots = await getAvailableTimeSlots();

  // Сериализуем Date объекты для передачи клиенту
  const serializedTimeSlots = timeSlots.map(slot => ({
    ...slot,
    date: slot.date instanceof Date ? slot.date.toISOString() : slot.date,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Назад</span>
            </a>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-600">
              cetofurnails
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Запишитесь к нам
          </h2>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <BookingForm
              services={services}
              designs={designs}
              timeSlots={serializedTimeSlots}
            />
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
