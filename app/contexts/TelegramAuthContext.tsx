'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TelegramWebApp } from '@/types/telegram-web-app';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramAuthContextType {
  user: TelegramUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're running inside Telegram
    const checkTelegram = () => {
      if (typeof window !== 'undefined') {
        const tg = window.TelegramWebApp;
        
        if (tg) {
          tg.ready();
          
          if (tg.initDataUnsafe?.user) {
            setUser(tg.initDataUnsafe.user as TelegramUser);
          }
        }
      }
    };

    checkTelegram();
    setIsLoading(false);
  }, []);

  const login = () => {
    if (typeof window !== 'undefined') {
      const tg = window.TelegramWebApp;
      if (tg) {
        tg.expand();
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <TelegramAuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}