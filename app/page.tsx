import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import ServicesSection from '@/components/ServicesSection';
import { Service, PortfolioItem, Category } from '@prisma/client';

export const revalidate = 20; // Revalidate every 20 seconds

async function getServices() {
  return await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
}

async function getPortfolioItems(): Promise<PortfolioItem[]> {
  return await prisma.portfolioItem.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

export default async function Home() {
  const services = await getServices();
  const portfolioItems = await getPortfolioItems();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-600">
              cetofurnails
            </h1>
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-primary-600 transition"
            >
              Админ панель
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Добро пожаловать!
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Для записи на маникюр нажмите на одну из кнопок ниже:
          </p>
        </div>

        {/* Booking CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/booking"
            className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
          >
            Записаться онлайн
          </Link>
          <a
            href="https://t.me/cetofurnogti_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#229ED9] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#1a8bc8] transition shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            Записаться через Telegram
          </a>
        </div>

        {/* Services Section */}
        <ServicesSection services={services} />

        {/* Portfolio Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
            Примеры работ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioItems.length > 0 ? (
              portfolioItems.map((item: PortfolioItem) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition group"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition text-center px-2">
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                Примеры работ пока не добавлены
              </div>
            )}
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
