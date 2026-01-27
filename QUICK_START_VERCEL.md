# Быстрый старт для Vercel

## Шаг 1: Подключите PostgreSQL базу данных

### Вариант A: Vercel Postgres (Самый простой)

1. В панели Vercel перейдите в ваш проект
2. Откройте вкладку **Storage**
3. Нажмите **Create Database** → выберите **Postgres**
4. Создайте базу данных
5. Vercel автоматически добавит переменные окружения

6. **Важно:** Добавьте переменную `DATABASE_URL`:
   - Перейдите в **Settings** → **Environment Variables**
   - Добавьте новую переменную:
     - **Name:** `DATABASE_URL`
     - **Value:** Скопируйте значение из `POSTGRES_PRISMA_URL` (или используйте `POSTGRES_URL`)
   - Примените для всех окружений (Production, Preview, Development)

### Вариант B: Neon (Бесплатно)

1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект
3. **ВАЖНО:** Скопируйте **Direct connection string** (НЕ Pooler!)
   - В Neon Dashboard → **Connection Details**
   - Выберите **Direct connection** (не Pooler)
   - Скопируйте строку и добавьте `?sslmode=require` в конец
4. В Vercel: **Settings** → **Environment Variables**
5. Добавьте:
   - **Name:** `DATABASE_URL`
   - **Value:** Ваш Direct connection string из Neon
   
**Примечание:** Pooler connection string вызывает таймауты при миграциях. Всегда используйте Direct connection для `DATABASE_URL`.

### Вариант C: Supabase (Бесплатно)

1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. В настройках проекта: **Database** → **Connection string**
4. Используйте **Connection pooling** (рекомендуется)
5. В Vercel добавьте `DATABASE_URL` с этим значением

## Шаг 2: Настройте другие переменные окружения

В Vercel: **Settings** → **Environment Variables**, добавьте:

- `NEXTAUTH_URL` - URL вашего сайта (например: `https://your-project.vercel.app`)
- `NEXTAUTH_SECRET` - Случайная строка (можно сгенерировать: `openssl rand -base64 32`)
- `ADMIN_EMAIL` - Email администратора (например: `markul06@mail.ru`)
- `ADMIN_PASSWORD` - Пароль администратора (например: `5696045mK`)
- `TELEGRAM_BOT_TOKEN` - Токен Telegram бота (например: `8346491967:AAFgpx5alWNAXmsjJsgg8lVC1HgM3aXOopk`)

## Шаг 3: Примените схему базы данных

После подключения базы данных нужно создать таблицы. **ВАЖНО:** Используйте Direct connection string (не Pooler)!

### Способ 1: Использовать db push (Рекомендуется для первого раза)

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Подключитесь к проекту
vercel link

# Скачайте переменные окружения
vercel env pull .env.local

# Примените схему к базе данных (создаст таблицы)
npx prisma db push

# Создайте администратора
npm run admin:update
```

### Способ 2: Использовать миграции (если уже есть миграции)

Если у вас уже есть файлы миграций в `prisma/migrations/`:

```bash
# Скачайте переменные окружения
vercel env pull .env.local

# Примените миграции
npx prisma migrate deploy

# Создайте администратора
npm run admin:update
```

**Примечание:** 
- Для первого деплоя используйте `db push` - это проще и надежнее
- `db push` синхронизирует схему Prisma с базой данных без создания файлов миграций
- Если получаете таймауты, убедитесь, что используете **Direct connection string** из Neon

## Шаг 4: Пересоберите проект

После добавления переменных окружения:

1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Нажмите **Redeploy** (или просто сделайте новый коммит)

## Шаг 5: Проверка

1. Откройте ваш сайт на Vercel
2. Перейдите на `/admin/login`
3. Войдите с учетными данными:
   - Email: `markul06@mail.ru`
   - Пароль: `5696045mK`

## Устранение проблем

### Ошибка "DATABASE_URL is not set"

- Убедитесь, что переменная `DATABASE_URL` добавлена в Vercel
- Проверьте, что она применена для нужного окружения (Production/Preview)
- Пересоберите проект после добавления переменных

### Ошибка подключения к базе данных / Таймаут при миграциях

- **Для Neon:** Используйте прямой connection string (не pooler) для миграций
  - В Neon найдите **Connection String** → выберите **Direct connection** (не Pooler)
  - Используйте этот URL для `DATABASE_URL` в Vercel
- Проверьте формат `DATABASE_URL` (должен начинаться с `postgresql://` или `postgres://`)
- Убедитесь, что база данных активна и доступна
- Проверьте настройки firewall/доступа в вашем провайдере БД
- **Важно:** Не используйте `postinstall` скрипт для миграций - применяйте их вручную через Vercel CLI

### Таблицы не созданы

- Запустите миграции вручную через Vercel CLI: `npx prisma migrate deploy`
- Или создайте миграцию локально и задеплойте

## Создание администратора после деплоя

Если нужно создать/обновить администратора:

```bash
# Скачайте переменные окружения
vercel env pull .env.local

# Запустите скрипт обновления
npm run admin:update
```

Или создайте временный API endpoint для этого (не забудьте удалить его после использования).
