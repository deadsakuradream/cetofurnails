import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram-notifications';

export const dynamic = 'force-dynamic';

/**
 * Тестовый endpoint для проверки отправки сообщений в Telegram
 * GET /api/telegram/test?chatId=123456789
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chatId = searchParams.get('chatId');
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  if (!chatId && !adminId) {
    return NextResponse.json({
      error: 'No chat ID provided and TELEGRAM_ADMIN_ID not set',
      hint: 'Add ?chatId=YOUR_TELEGRAM_ID to the URL or set TELEGRAM_ADMIN_ID environment variable',
    }, { status: 400 });
  }

  const targetChatId = chatId || adminId;
  const testMessage = `🧪 Тестовое сообщение от бота!\n\nЕсли вы видите это сообщение, значит уведомления работают правильно.\n\nВаш Chat ID: ${targetChatId}`;

  try {
    const result = await sendTelegramMessage(targetChatId!, testMessage);
    
    return NextResponse.json({
      success: result,
      message: result 
        ? 'Сообщение отправлено успешно! Проверьте Telegram.' 
        : 'Не удалось отправить сообщение. Проверьте логи.',
      chatId: targetChatId,
      botTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
      adminIdConfigured: !!process.env.TELEGRAM_ADMIN_ID,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      chatId: targetChatId,
      botTokenConfigured: !!process.env.TELEGRAM_BOT_TOKEN,
      adminIdConfigured: !!process.env.TELEGRAM_ADMIN_ID,
    }, { status: 500 });
  }
}
