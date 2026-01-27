import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  isActive: z.boolean(),
  categoryId: z.string().optional().nullable(),
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
    const data = serviceSchema.parse(body);

    const service = await prisma.service.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Неверные данные', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Service update error:', error);
    return NextResponse.json(
      { message: 'Ошибка при обновлении услуги' },
      { status: 500 }
    );
  }
}
