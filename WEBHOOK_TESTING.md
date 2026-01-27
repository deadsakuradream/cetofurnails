# Тестирование Telegram Webhook

## Проверка доступности endpoint

### 1. Через браузер (GET запрос)

Откройте в браузере:
```
https://nogtikaif.vercel.app/api/telegram/webhook
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "message": "Telegram webhook endpoint is active",
  "methods": ["GET", "POST"],
  "note": "This endpoint receives POST requests from Telegram. Use POST to test webhook functionality."
}
```

### 2. Через curl (POST запрос - тест)

```bash
curl -X POST https://nogtikaif.vercel.app/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "update_id": 123456789,
    "message": {
      "message_id": 1,
      "from": {
        "id": 123456789,
        "is_bot": false,
        "first_name": "Test",
        "username": "testuser"
      },
      "chat": {
        "id": 123456789,
        "type": "private"
      },
      "date": 1234567890,
      "text": "/start"
    }
  }'
```

Должен вернуться: `{"ok": true}`

## Настройка webhook в Telegram

### 1. Установка webhook

```bash
curl -X POST "https://api.telegram.org/bot8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://nogtikaif.vercel.app/api/telegram/webhook"}'
```

### 2. Проверка webhook

```bash
curl "https://api.telegram.org/bot8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk/getWebhookInfo"
```

Должен вернуться JSON с информацией о webhook, включая ваш URL.

### 3. Удаление webhook (если нужно)

```bash
curl -X POST "https://api.telegram.org/bot8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk/deleteWebhook"
```

## Тестирование в Telegram

1. Откройте вашего бота в Telegram
2. Отправьте команду `/start`
3. Должно появиться сообщение с кнопками:
   - 📱 Поделиться контактом
   - 📝 Записаться онлайн

## Устранение проблем

### 404 ошибка

- Убедитесь, что файл `app/api/telegram/webhook/route.ts` существует
- Проверьте, что проект задеплоен на Vercel
- Убедитесь, что путь правильный: `/api/telegram/webhook`

### Webhook не работает

1. Проверьте логи Vercel:
   - Зайдите в проект на Vercel
   - Откройте **Deployments** → выберите последний деплой → **Functions** → найдите `/api/telegram/webhook`

2. Проверьте переменные окружения:
   - `TELEGRAM_BOT_TOKEN` должен быть установлен
   - `NEXT_PUBLIC_APP_URL` должен быть установлен

3. Проверьте webhook через Telegram API:
   ```bash
   curl "https://api.telegram.org/bot8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk/getWebhookInfo"
   ```

### Ошибка 500

- Проверьте логи сервера на Vercel
- Убедитесь, что `TELEGRAM_BOT_TOKEN` правильный
- Проверьте, что URL в `NEXT_PUBLIC_APP_URL` правильный

## Полезные команды

### Получить информацию о боте

```bash
curl "https://api.telegram.org/bot8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk/getMe"
```

### Отправить тестовое сообщение

```bash
curl -X POST "https://api.telegram.org/bot8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": YOUR_CHAT_ID,
    "text": "Test message"
  }'
```

Замените `YOUR_CHAT_ID` на ваш Telegram ID (можно узнать через @userinfobot)
