import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Запись удалена' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { message: 'Ошибка при удалении записи' },
      { status: 500 }
    );
  }
}
