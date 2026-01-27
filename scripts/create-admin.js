const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = 'Администратор';

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Администратор уже существует');
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log('Администратор успешно создан:');
    console.log(`Email: ${email}`);
    console.log(`Пароль: ${password}`);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
