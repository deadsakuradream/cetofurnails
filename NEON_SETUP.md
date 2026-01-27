# Настройка Neon для Vercel

## Проблема с таймаутами

Если вы получаете ошибку таймаута при деплое:
```
Error: P1002
The database server at `ep-xxx-pooler.c-2.eu-central-1.aws.neon.tech:5432` was reached but timed out.
```

## Решение

### 1. Используйте Direct Connection для миграций

В Neon есть два типа connection strings:
- **Pooler** (с `-pooler` в URL) - для приложения, но не для миграций
- **Direct** (без `-pooler`) - для миграций и административных задач

**Важно:** Для `DATABASE_URL` в Vercel используйте **Direct connection string** из Neon.

### 2. Как получить правильный connection string

1. Зайдите в ваш проект на Neon
2. Перейдите в **Dashboard** → **Connection Details**
3. Найдите раздел **Connection string**
4. Выберите **Direct connection** (НЕ Pooler)
5. Скопируйте строку подключения
6. Добавьте `?sslmode=require` в конец, если его нет

Пример правильного формата:
```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Настройка в Vercel

1. Перейдите в **Settings** → **Environment Variables**
2. Найдите или создайте переменную `DATABASE_URL`
3. Вставьте **Direct connection string** из Neon
4. Убедитесь, что применено для всех окружений (Production, Preview, Development)
5. Сохраните и пересоберите проект

### 4. Применение миграций

После настройки правильного connection string:

```bash
# Через Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Или используйте db push для первого раза
npx prisma db push
```

### 5. Альтернатива: Использовать оба connection string

Если хотите использовать pooler для приложения:

1. Создайте две переменные:
   - `DATABASE_URL` - Direct connection (для миграций)
   - `DATABASE_POOLER_URL` - Pooler connection (для приложения)

2. Обновите `lib/prisma.ts` для использования pooler в runtime:
```typescript
const databaseUrl = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
```

Но для начала достаточно использовать Direct connection для всего.

## Проверка

После настройки:
1. Пересоберите проект на Vercel
2. Проверьте логи - не должно быть ошибок таймаута
3. Примените миграции вручную через Vercel CLI
4. Создайте администратора: `npm run admin:update`
