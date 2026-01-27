const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const newEmail = 'markul06@mail.ru';
  const newPassword = '5696045mK';
  const name = 'Администратор';

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    // Удаляем всех существующих пользователей (старых админов)
    console.log('Удаление старых администраторов...');
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Удалено пользователей: ${deletedUsers.count}`);

    // Создаем нового администратора
    console.log('Создание нового администратора...');
    const user = await prisma.user.create({
      data: {
        email: newEmail,
        password: hashedPassword,
        name,
      },
    });

    console.log('✅ Администратор успешно обновлен:');
    console.log(`Email: ${newEmail}`);
    console.log(`Пароль: ${newPassword}`);
    console.log(`ID: ${user.id}`);
  } catch (error) {
    console.error('❌ Ошибка при обновлении администратора:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
