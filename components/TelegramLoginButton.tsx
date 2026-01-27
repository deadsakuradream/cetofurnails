'use client';

import { useState } from 'react';
import { useTelegramAuth } from '@/app/contexts/TelegramAuthContext';

interface TelegramWebApp {
  initData: string;
}

export default function TelegramLoginButton() {
  const { user, login } = useTelegramAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleTelegramLogin = async () => {
    setIsAuthLoading(true);
    
    try {
      const tg = window.TelegramWebApp;
      
      if (tg && tg.initData) {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData: tg.initData }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('telegramUser', JSON.stringify(data.user));
          window.location.reload();
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Ошибка авторизации' }));
          alert(errorData.message || 'Ошибка при авторизации через Telegram');
        }
      } else {
        login();
      }
    } catch (error) {
      console.error('Telegram login error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
          {user.first_name?.[0]}
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {user.first_name} {user.last_name || ''}
          </p>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleTelegramLogin}
      disabled={isAuthLoading}
      className="w-full bg-[#229ED9] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#1a8bc8] transition disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
      {isAuthLoading ? 'Вход...' : 'Войти через Telegram'}
    </button>
  );
}