/**
 * Утилиты для отправки уведомлений в Telegram
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Отправляет сообщение в Telegram с retry логикой
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  retries: number = 3
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  if (!chatId) {
    console.warn('Chat ID not provided');
    return false;
  }

  console.log(`Attempting to send Telegram message to chat ID: ${chatId}`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Sending Telegram message (attempt ${attempt}/${retries}) to chat ${chatId}`);

      // Используем AbortController для таймаута
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`Request timeout after 10 seconds (attempt ${attempt})`);
        controller.abort();
      }, 10000); // 10 секунд таймаут

      const requestBody = {
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      };

      console.log(`Request body:`, { chat_id: chatId, text_length: text.length, parse_mode: parseMode });

      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Response received: status ${response.status}, ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Telegram API error (attempt ${attempt}/${retries}):`, errorText);
        console.error(`Response status: ${response.status}`);

        // Если это последняя попытка, возвращаем false
        if (attempt === retries) {
          console.error('All retry attempts failed');
          return false;
        }

        // Ждем перед следующей попыткой (exponential backoff)
        console.log(`Waiting ${1000 * attempt}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      let result;
      try {
        result = await response.json();
        console.log('Telegram message sent successfully:', result);
        console.log('Response result.ok:', result.ok);
        return result.ok === true;
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        const textResponse = await response.text();
        console.error('Response text:', textResponse);
        return false;
      }
    } catch (error: any) {
      console.error(`Error sending Telegram message (attempt ${attempt}/${retries}):`, error);
      console.error(`Error name: ${error.name}, code: ${error.code}, message: ${error.message}`);

      // Если это последняя попытка, возвращаем false
      if (attempt === retries) {
        console.error('All retry attempts failed due to errors');
        return false;
      }

      // Если ошибка связана с сетью, пробуем еще раз
      if (error.name === 'AbortError' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        console.log(`Network error detected, retrying in ${1000 * attempt}ms...`);
        // Ждем перед следующей попыткой (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Для других ошибок не повторяем
      console.error('Non-retryable error, stopping attempts');
      return false;
    }
  }

  return false;
}

/**
 * Отправляет уведомление админу о новой записи
 */
export async function notifyAdminAboutBooking(bookingData: {
  clientName: string;
  clientPhone: string;
  clientTelegram: string | null;
  serviceName: string;
  designName?: string | null;
  totalPrice?: number;
  date: Date | string;
  time: string;
  notes?: string | null;
}): Promise<boolean> {
  console.log('notifyAdminAboutBooking called with:', {
    clientName: bookingData.clientName,
    hasAdminId: !!TELEGRAM_ADMIN_ID,
    adminId: TELEGRAM_ADMIN_ID ? '***' : 'NOT SET',
  });

  if (!TELEGRAM_ADMIN_ID) {
    console.warn('TELEGRAM_ADMIN_ID not configured - notification will not be sent');
    return false;
  }

  // Форматируем дату
  const date = bookingData.date instanceof Date
    ? bookingData.date
    : new Date(bookingData.date);
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  // Форматируем телефон в читаемый вид
  const phoneDigits = bookingData.clientPhone.replace(/\D/g, '');
  let phone = phoneDigits;
  if (phoneDigits.startsWith('7') && phoneDigits.length === 11) {
    // Формат: +7 (XXX) XXX-XX-XX
    phone = `+7 (${phoneDigits.slice(1, 4)}) ${phoneDigits.slice(4, 7)}-${phoneDigits.slice(7, 9)}-${phoneDigits.slice(9, 11)}`;
  } else if (phoneDigits.length > 0) {
    phone = `+${phoneDigits}`;
  }

  // Формируем сообщение
  let message = `🔔 <b>Новая запись!</b>\n\n`;
  message += `👤 <b>Клиент:</b> ${escapeHtml(bookingData.clientName)}\n`;
  message += `📞 <b>Телефон:</b> <a href="tel:${phone}">${phone}</a>\n`;

  if (bookingData.clientTelegram) {
    const telegramUsername = bookingData.clientTelegram.replace('@', '');
    message += `💬 <b>Telegram:</b> <a href="https://t.me/${telegramUsername}">@${telegramUsername}</a>\n`;
  }

  message += `📅 <b>Дата:</b> ${formattedDate}\n`;
  message += `⏰ <b>Время:</b> ${bookingData.time}\n`;
  message += `💅 <b>Услуга:</b> ${escapeHtml(bookingData.serviceName)}\n`;

  if (bookingData.designName) {
    message += `🎨 <b>Дизайн:</b> ${escapeHtml(bookingData.designName)}\n`;
  }

  if (bookingData.totalPrice) {
    message += `💰 <b>Итого:</b> ${bookingData.totalPrice} ₽\n`;
  }

  if (bookingData.notes) {
    message += `\n📝 <b>Комментарий:</b> ${escapeHtml(bookingData.notes)}`;
  }

  return await sendTelegramMessage(TELEGRAM_ADMIN_ID, message, 'HTML');
}

/**
 * Экранирует HTML символы для безопасной отправки
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Получает Telegram user ID по username
 */
async function getUserIdByUsername(username: string): Promise<string | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN not configured');
    return null;
  }

  // Убираем @ если есть
  const cleanUsername = username.replace('@', '');

  console.log(`Attempting to get user ID for username: ${cleanUsername}`);

  // Telegram Bot API не предоставляет прямого метода для получения user ID по username
  // Возвращаем username с @ для использования в chat_id
  // Telegram API поддерживает отправку сообщений по @username если бот знает пользователя
  return `@${cleanUsername}`;
}

/**
 * Отправляет уведомление пользователю о подтверждении записи
 */
export async function notifyUserAboutBooking(bookingData: {
  clientTelegram: string | null;
  telegramUserId?: string | null;
  clientName: string;
  serviceName: string;
  designName?: string | null;
  totalPrice?: number;
  date: Date | string;
  time: string;
}): Promise<boolean> {
  console.log('notifyUserAboutBooking called with:', {
    clientTelegram: bookingData.clientTelegram,
    clientName: bookingData.clientName,
  });

  if (!bookingData.clientTelegram && !bookingData.telegramUserId) {
    console.warn('Neither Telegram username nor User ID provided - notification will not be sent');
    return false;
  }

  // Определяем ID получателя: приоритет за telegramUserId, иначе пробуем разрешить username
  let userId: string | number | null = bookingData.telegramUserId || null;

  if (!userId && bookingData.clientTelegram) {
    // Пробуем получить user ID по username
    userId = await getUserIdByUsername(bookingData.clientTelegram);
  }

  if (!userId) {
    console.warn('Could not determine Telegram user ID');
    return false;
  }

  // Форматируем дату
  const date = bookingData.date instanceof Date
    ? bookingData.date
    : new Date(bookingData.date);
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  // Формируем сообщение
  let message = `✅ <b>Запись подтверждена!</b>\n\n`;
  message += `Здравствуйте, ${escapeHtml(bookingData.clientName)}!\n\n`;
  message += `Ваша запись успешно создана:\n\n`;
  message += `💅 <b>Услуга:</b> ${escapeHtml(bookingData.serviceName)}\n`;
  if (bookingData.designName) {
    message += `🎨 <b>Дизайн:</b> ${escapeHtml(bookingData.designName)}\n`;
  }
  message += `📅 <b>Дата:</b> ${formattedDate}\n`;
  message += `⏰ <b>Время:</b> ${bookingData.time}\n`;
  if (bookingData.totalPrice) {
    message += `💰 <b>Итого:</b> ${bookingData.totalPrice} ₽\n`;
  }
  message += `\n`;
  message += `Ждем вас! 💖\n\n`;
  message += `<i>Если нужно отменить или перенести запись, напишите нам: @cetofur</i>`;

  return await sendTelegramMessage(userId, message, 'HTML');
}

/**
 * Отправляет напоминание пользователю о предстоящей записи
 */
export async function sendBookingReminder(bookingData: {
  clientTelegram: string | null;
  telegramUserId?: string | null;
  clientName: string;
  serviceName: string;
  designName?: string | null;
  totalPrice?: number;
  date: Date | string;
  time: string;
}): Promise<boolean> {
  console.log('sendBookingReminder called with:', {
    clientTelegram: bookingData.clientTelegram,
    clientName: bookingData.clientName,
  });

  if (!bookingData.clientTelegram && !bookingData.telegramUserId) {
    console.warn('Neither Telegram username nor User ID provided - reminder will not be sent');
    return false;
  }

  // Определяем ID получателя: приоритет за telegramUserId, иначе пробуем разрешить username
  let userId: string | number | null = bookingData.telegramUserId || null;

  if (!userId && bookingData.clientTelegram) {
    // Пробуем получить user ID по username
    userId = await getUserIdByUsername(bookingData.clientTelegram);
  }

  if (!userId) {
    console.warn('Could not determine Telegram user ID');
    return false;
  }

  // Форматируем дату
  const date = bookingData.date instanceof Date
    ? bookingData.date
    : new Date(bookingData.date);
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

  // Формируем сообщение
  let message = `⏰ <b>Напоминание о записи</b>\n\n`;
  message += `Здравствуйте, ${escapeHtml(bookingData.clientName)}!\n\n`;
  message += `Напоминаем, что завтра у вас запись:\n\n`;
  message += `💅 <b>Услуга:</b> ${escapeHtml(bookingData.serviceName)}\n`;
  if (bookingData.designName) {
    message += `🎨 <b>Дизайн:</b> ${escapeHtml(bookingData.designName)}\n`;
  }
  message += `📅 <b>Дата:</b> ${formattedDate}\n`;
  message += `⏰ <b>Время:</b> ${bookingData.time}\n`;
  if (bookingData.totalPrice) {
    message += `💰 <b>Итого:</b> ${bookingData.totalPrice} ₽\n`;
  }
  message += `\n`;
  message += `Будем рады вас видеть! 💖\n\n`;
  message += `<i>Если не сможете прийти, пожалуйста, предупредите нас заранее.</i>`;

  return await sendTelegramMessage(userId, message, 'HTML');
}

