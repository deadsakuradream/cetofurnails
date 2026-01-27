import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac } from 'crypto';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

function validateTelegramData(initData: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(TELEGRAM_BOT_TOKEN)
    .digest();
  
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return hash === computedHash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json(
        { message: 'No initData provided' },
        { status: 400 }
      );
    }

    // Валидируем данные от Telegram
    const isValid = validateTelegramData(initData);
    
    if (!isValid && TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { message: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    // Парсим данные пользователя
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user || !user.id) {
      return NextResponse.json(
        { message: 'No user data' },
        { status: 400 }
      );
    }

    // Ищем или создаем пользователя
    let dbUser = await prisma.user.findFirst({
      where: { telegramId: String(user.id) },
    });

    if (!dbUser) {
      // Создаем нового пользователя
      dbUser = await prisma.user.create({
        data: {
          email: `tg_${user.id}@telegram.local`,
          password: 'telegram_auth',
          name: user.first_name + (user.last_name ? ` ${user.last_name}` : ''),
          telegramId: String(user.id),
        },
      });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        name: dbUser.name,
        telegramId: dbUser.telegramId,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}