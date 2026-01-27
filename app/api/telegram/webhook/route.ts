import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export const dynamic = 'force-dynamic';

// GET метод для проверки, что endpoint работает
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Telegram webhook endpoint is active',
    methods: ['GET', 'POST'],
    note: 'This endpoint receives POST requests from Telegram. Use POST to test webhook functionality.',
  });
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    contact?: {
      phone_number: string;
      first_name: string;
      last_name?: string;
      user_id: number;
    };
  };
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();
    console.log('Webhook received:', JSON.stringify(body, null, 2));

    // Проверяем, что это сообщение
    if (!body.message) {
      return NextResponse.json({ ok: true });
    }

    const message = body.message;
    const chatId = message.chat.id;
    const text = message.text;

    // Обработка команды /start
    if (text === '/start') {
      // Если это админ (проверяем по TELEGRAM_ADMIN_ID), показываем его ID
      const adminId = process.env.TELEGRAM_ADMIN_ID;
      let welcomeMessage = '👋 Добро пожаловать!\n\nДля записи на услугу нажмите кнопку "Записаться онлайн" слева снизу ↙️';

      if (adminId && String(chatId) === adminId) {
        welcomeMessage += `\n\n🔑 Ваш Telegram ID: ${chatId}\n(Используйте этот ID для настройки уведомлений)`;
      }

      const replyMarkup = {
        keyboard: [
          [
            {
              text: '📱 Поделиться контактом',
              request_contact: true,
            },
          ],
          [
            {
              text: '📝 Записаться онлайн',
              web_app: {
                url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app/booking',
              },
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      };

      await sendMessage(
        chatId,
        welcomeMessage,
        replyMarkup
      );
    }

    // Команда для получения ID (для настройки уведомлений)
    if (text === '/myid' || text === '/id') {
      await sendMessage(
        chatId,
        `🆔 Ваш Telegram ID: <code>${chatId}</code>\n\nИспользуйте этот ID для переменной окружения TELEGRAM_ADMIN_ID.`,
        undefined
      );
    }

    // Обработка полученного контакта
    if (message.contact) {
      const contact = message.contact;
      const phoneNumber = contact.phone_number;
      const firstName = contact.first_name;
      const lastName = contact.last_name || '';

      await sendMessage(
        chatId,
        `✅ Спасибо! Ваш номер телефона сохранен: ${phoneNumber}\n\nТеперь вы можете записаться на услугу, нажав кнопку "📝 Записаться онлайн".`,
        {
          keyboard: [
            [
              {
                text: '📝 Записаться онлайн',
                web_app: {
                  url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app/booking',
                },
              },
            ],
          ],
          resize_keyboard: true,
        }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
