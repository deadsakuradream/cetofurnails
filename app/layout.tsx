import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import { TelegramAuthProvider } from "@/app/contexts/TelegramAuthContext";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "cetofurnails - Запись онлайн",
  description: "Запишитесь к мастеру маникюра онлайн. Посмотрите наши услуги и примеры работ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <TelegramAuthProvider>
          <Providers>{children}</Providers>
        </TelegramAuthProvider>
      </body>
    </html>
  );
}
