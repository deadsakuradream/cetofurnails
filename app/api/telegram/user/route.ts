import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// API для получения данных пользователя Telegram по его ID
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const telegramId = searchParams.get('telegramId');

        if (!telegramId) {
            return NextResponse.json(
                { message: 'telegramId is required' },
                { status: 400 }
            );
        }

        const user = await prisma.telegramUser.findUnique({
            where: { telegramId },
            select: {
                phone: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!user) {
            return NextResponse.json({ phone: null, firstName: null, lastName: null });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching telegram user:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
