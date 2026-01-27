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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = timeSlotSchema.parse(body);

    const slot = await prisma.timeSlot.update({
      where: { id: params.id },
      data: {
        date: typeof data.date === 'string' ? new Date(data.date) : data.date,
        startTime: data.startTime,
        isAvailable: data.isAvailable,
      },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Time slot update error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении временного слота' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.timeSlot.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Слот удалён' });
  } catch (error) {
    console.error('Time slot delete error:', error);
    return NextResponse.json(
      { message: 'Ошибка при удалении временного слота' },
      { status: 500 }
    );
  }
}
