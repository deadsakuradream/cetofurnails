import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const portfolioSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  isActive: z.boolean(),
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
    const data = portfolioSchema.parse(body);

    const item = await prisma.portfolioItem.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Portfolio update error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении работы' },
      { status: 500 }
    );
  }
}
