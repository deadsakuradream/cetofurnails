import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Файл должен быть изображением' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (макс 10 МБ)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Размер файла не должен превышать 10 МБ' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Загружаем в Cloudinary
    const url = await uploadImage(buffer, 'portfolio');

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error:', error);

    return NextResponse.json(
      {
        message: 'Ошибка при загрузке изображения',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
