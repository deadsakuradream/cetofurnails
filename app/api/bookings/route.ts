import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getPhoneDigits } from '@/lib/phoneMask';
import { notifyAdminAboutBooking, notifyUserAboutBooking } from '@/lib/telegram-notifications';
import { waitUntil } from '@vercel/functions';

export const dynamic = 'force-dynamic';

const bookingSchema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(10),
  clientTelegram: z.string().optional().or(z.literal('')),
  telegramUserId: z.string().optional().or(z.literal('')),
  serviceId: z.string(),
  designId: z.string().optional(),
  timeSlotId: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    // Проверяем, что слот доступен
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['pending', 'confirmed'],
            },
          },
        },
      },
    });

    if (!timeSlot || !timeSlot.isAvailable || timeSlot.bookings.length > 0) {
      return NextResponse.json(
        { message: 'Выбранное время недоступно' },
        { status: 400 }
      );
    }

    // Проверяем, что услуга существует и активна
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { message: 'Услуга недоступна' },
        { status: 400 }
      );
    }

    // Нормализуем номер телефона (сохраняем только цифры)
    const normalizedPhone = getPhoneDigits(data.clientPhone);

    // Создаем запись
    const booking = await prisma.booking.create({
      data: {
        serviceId: data.serviceId,
        timeSlotId: data.timeSlotId,
        clientName: data.clientName,
        clientPhone: normalizedPhone, // Keep normalized phone
        clientTelegram: data.clientTelegram || null, // Keep handling for null
        telegramUserId: data.telegramUserId || null, // Add telegramUserId
        designId: data.designId || null,
        notes: data.notes || null,
        status: 'pending',
      },
      include: {
        service: true,
        design: true, // Include design details
        timeSlot: true,
      },
    });

    // Отправляем уведомления в Telegram
    // Используем waitUntil для фоновых задач на Vercel
    console.log('Starting to send Telegram notifications...');

    // Уведомление админу
    const adminNotificationPromise = notifyAdminAboutBooking({
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      clientTelegram: booking.clientTelegram,
      serviceName: booking.service.name,
      designName: booking.design?.name,
      totalPrice: booking.service.price + (booking.design?.price || 0),
      date: booking.timeSlot.date,
      time: booking.timeSlot.startTime,
      notes: booking.notes,
    })
      .then(result => {
        console.log('Admin Telegram notification result:', result);
        if (!result) {
          console.warn('Admin Telegram notification returned false - message may not have been sent');
        }
        return result;
      })
      .catch(error => {
        console.error('Failed to send admin Telegram notification:', error);
        console.error('Error stack:', error.stack);
        return false;
      });

    // Уведомление пользователю (если указан Telegram)
    let userNotificationPromise = Promise.resolve(false);
    if (booking.clientTelegram) {
      userNotificationPromise = notifyUserAboutBooking({
        clientTelegram: booking.clientTelegram,
        telegramUserId: booking.telegramUserId,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        designName: booking.design?.name,
        totalPrice: booking.service.price + (booking.design?.price || 0),
        date: booking.timeSlot.date,
        time: booking.timeSlot.startTime,
      })
        .then(result => {
          console.log('User Telegram notification result:', result);
          if (!result) {
            console.warn('User Telegram notification returned false - message may not have been sent');
          }
          return result;
        })
        .catch(error => {
          console.error('Failed to send user Telegram notification:', error);
          console.error('Error stack:', error.stack);
          return false;
        });
    }

    // Используем waitUntil для фоновых задач на Vercel
    // Это гарантирует выполнение промисов даже после возврата ответа
    waitUntil(Promise.all([adminNotificationPromise, userNotificationPromise]));

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Booking creation error:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании записи' },
      { status: 500 }
    );
  }
}
