import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем директорию для загрузок, если её нет
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path,
    });
    
    // Проверяем, является ли это ошибкой файловой системы (что нормально на Vercel)
    if (error.code === 'EROFS' || error.code === 'EACCES' || error.errno === -30) {
      return NextResponse.json(
        { 
          message: 'Загрузка файлов на сервер не поддерживается. Используйте внешний URL изображения или настройте Vercel Blob Storage.',
          error: 'File system is read-only on Vercel',
          hint: 'Please use an external image URL or configure Vercel Blob Storage'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Ошибка при загрузке файла',
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
