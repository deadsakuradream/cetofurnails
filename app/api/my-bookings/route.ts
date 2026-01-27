import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { message: 'User ID is required' },
                { status: 400 }
            );
        }

        const bookings = await prisma.booking.findMany({
            where: {
                telegramUserId: userId,
            },
            include: {
                service: true,
                design: true,
                timeSlot: true,
            },
            orderBy: {
                timeSlot: {
                    date: 'desc',
                },
            },
        });

        // Calculate total price for each booking
        const bookingsWithPrice = bookings.map((booking) => {
            const servicePrice = booking.service.price;
            const designPrice = booking.design?.price || 0;
            const totalPrice = servicePrice + designPrice;

            return {
                ...booking,
                totalPrice,
            };
        });

        return NextResponse.json(bookingsWithPrice);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
