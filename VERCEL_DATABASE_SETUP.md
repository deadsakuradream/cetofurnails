# Настройка базы данных для Vercel

## Проблема
SQLite не работает на Vercel, так как файловая система доступна только для чтения. Нужно использовать PostgreSQL.

## Решение: Подключение PostgreSQL к Vercel

### Вариант 1: Vercel Postgres (Рекомендуется)

1. **Создайте базу данных Vercel Postgres:**
   - Зайдите в ваш проект на Vercel
   - Перейдите в раздел **Storage**
   - Нажмите **Create Database**
   - Выберите **Postgres**
   - Создайте базу данных

2. **Переменные окружения будут добавлены автоматически:**
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

3. **Настройте DATABASE_URL в Vercel:**
   - Перейдите в **Settings** → **Environment Variables**
   - Добавьте переменную `DATABASE_URL` со значением `POSTGRES_PRISMA_URL` (или используйте `POSTGRES_URL`)

### Вариант 2: Neon (Бесплатный вариант)

1. **Создайте аккаунт на Neon:**
   - Перейдите на https://neon.tech
   - Создайте бесплатный аккаунт
   - Создайте новый проект

2. **ВАЖНО: Скопируйте Direct connection string (НЕ Pooler!):**
   - В панели Neon перейдите в **Dashboard** → **Connection Details**
   - Найдите раздел **Connection string**
   - Выберите **Direct connection** (НЕ Pooler!)
   - Скопируйте строку подключения
   - Добавьте `?sslmode=require` в конец, если его нет
   - Формат: `postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

3. **Добавьте в Vercel:**
   - Перейдите в **Settings** → **Environment Variables**
   - Добавьте переменную `DATABASE_URL` со значением **Direct connection string** из Neon
   
**Почему Direct, а не Pooler?**
- Pooler connection вызывает таймауты при миграциях и административных операциях
- Direct connection работает стабильнее для всех операций
- Для production приложения можно использовать pooler только для runtime запросов, но для начала используйте Direct

### Вариант 3: Supabase (Бесплатный вариант)

1. **Создайте проект на Supabase:**
   - Перейдите на https://supabase.com
   - Создайте бесплатный проект

2. **Получите connection string:**
   - В настройках проекта найдите **Database** → **Connection string**
   - Используйте **Connection pooling** (рекомендуется) или **Direct connection**

3. **Добавьте в Vercel:**
   - Перейдите в **Settings** → **Environment Variables**
   - Добавьте переменную `DATABASE_URL` со значением connection string

## После подключения базы данных

1. **Примените миграции Prisma:**
   ```bash
   # Локально (с переменными окружения Vercel)
   npx prisma migrate deploy
   
   # Или через Vercel CLI
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

2. **Создайте администратора:**
   ```bash
   # Убедитесь, что DATABASE_URL указывает на вашу PostgreSQL базу
   npm run admin:update
   ```

3. **Пересоберите проект на Vercel:**
   - Vercel автоматически пересоберет проект при изменении переменных окружения
   - Или запустите деплой вручную

## Проверка подключения

После настройки проверьте:
1. Логи Vercel на наличие ошибок подключения к БД
2. Попробуйте войти в админ панель
3. Если ошибка сохраняется, проверьте формат `DATABASE_URL`

## Формат DATABASE_URL для PostgreSQL

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

Или с connection pooling (для Vercel Postgres):
```
postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&pgbouncer=true
```

## Важные замечания

- **Не используйте SQLite на Vercel** - это не будет работать
- **Используйте connection pooling** для production (Vercel Postgres делает это автоматически)
- **Храните DATABASE_URL в секретах** - не коммитьте в git
- **Создайте резервные копии** базы данных регулярно
