require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServices() {
  try {
    const services = await prisma.service.findMany();
    console.log('Услуги в БД:');
    console.log(JSON.stringify(services, null, 2));
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();