import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingReminder } from '@/lib/telegram-notifications';

export const dynamic = 'force-dynamic';

/**
 * API endpoint для отправки напоминаний о записях
 * Вызывается ежедневно через cron job
 * Отправляет напоминания пользователям за день до их записи
 */
export async function GET(request: NextRequest) {
    try {
        console.log('Starting reminder notifications cron job...');

        // Используем московское время для определения "завтра"
        const moscowNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
        const tomorrowMoscow = new Date(moscowNow);
        tomorrowMoscow.setDate(tomorrowMoscow.getDate() + 1);
        // Строим дату как YYYY-MM-DD и парсим в UTC midnight (так хранятся даты слотов)
        const tomorrowStr = `${tomorrowMoscow.getFullYear()}-${String(tomorrowMoscow.getMonth() + 1).padStart(2, '0')}-${String(tomorrowMoscow.getDate()).padStart(2, '0')}`;
        const tomorrow = new Date(tomorrowStr + 'T00:00:00.000Z');
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setUTCDate(dayAfterTomorrow.getUTCDate() + 1);

        console.log(`Looking for bookings between ${tomorrow.toISOString()} and ${dayAfterTomorrow.toISOString()}`);

        // Находим все записи на завтра с активным статусом и Telegram username
        const bookings = await prisma.booking.findMany({
            where: {
                timeSlot: {
                    date: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow,
                    },
                },
                status: {
                    in: ['pending', 'confirmed'],
                },
                OR: [
                    { clientTelegram: { not: null } },
                    { telegramUserId: { not: null } },
                ],
            },
            include: {
                service: true,
                timeSlot: true,
            },
        });

        console.log(`Found ${bookings.length} bookings for tomorrow with Telegram contact info`);

        // Отправляем напоминания
        const results = await Promise.allSettled(
            bookings.map(async (booking) => {
                if (!booking.clientTelegram && !booking.telegramUserId) return { success: false, bookingId: booking.id };

                console.log(`Sending reminder for booking ${booking.id} to ${booking.clientTelegram || booking.telegramUserId}`);

                const success = await sendBookingReminder({
                    clientTelegram: booking.clientTelegram,
                    telegramUserId: booking.telegramUserId,
                    clientName: booking.clientName,
                    serviceName: booking.service.name,
                    date: booking.timeSlot.date,
                    time: booking.timeSlot.startTime,
                });

                return {
                    success,
                    bookingId: booking.id,
                    clientName: booking.clientName,
                    clientTelegram: booking.clientTelegram,
                };
            })
        );

        // Подсчитываем статистику
        const successful = results.filter(
            (r) => r.status === 'fulfilled' && r.value.success
        ).length;
        const failed = results.length - successful;

        console.log(`Reminder notifications completed: ${successful} successful, ${failed} failed`);

        return NextResponse.json({
            success: true,
            message: 'Reminder notifications sent',
            stats: {
                total: bookings.length,
                successful,
                failed,
            },
            results: results.map((r) =>
                r.status === 'fulfilled' ? r.value : { success: false, error: 'rejected' }
            ),
        });
    } catch (error) {
        console.error('Error in reminder notifications cron job:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error sending reminder notifications',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
