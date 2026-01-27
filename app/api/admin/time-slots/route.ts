import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const timeSlotSchema = z.object({
  date: z.string().or(z.date()),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/),
  isAvailable: z.boolean(),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = timeSlotSchema.parse(body);

    const slot = await prisma.timeSlot.create({
      data: {
        date: typeof data.date === 'string' ? new Date(data.date) : data.date,
        startTime: data.startTime,
        isAvailable: data.isAvailable,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Time slot creation error:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании временного слота' },
      { status: 500 }
    );
  }
}
