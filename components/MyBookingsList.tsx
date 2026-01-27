'use client';

import { useEffect, useState } from 'react';
import BookingCard from './BookingCard';
import TelegramLoginButton from './TelegramLoginButton';

interface Booking {
    id: string;
    status: string;
    service: {
        name: string;
        price: number;
    };
    design?: {
        name: string;
        price: number;
    } | null;
    timeSlot: {
        date: Date | string;
        startTime: string;
    };
    totalPrice: number;
}

export default function MyBookingsList() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [telegramUser, setTelegramUser] = useState<any>(null);

    useEffect(() => {
        // Check for Telegram WebApp user
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            const user = window.Telegram.WebApp.initDataUnsafe?.user;
            if (user) {
                setTelegramUser(user);
                fetchBookings(user.id.toString());
            } else {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleTelegramAuth = (user: any) => {
        setTelegramUser(user);
        fetchBookings(user.id.toString());
    };

    const fetchBookings = async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/my-bookings?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            const data = await response.json();
            setBookings(data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError('Не удалось загрузить записи');
        } finally {
            setIsLoading(false);
        }
    };

    if (!telegramUser) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Мои записи</h2>
                <p className="text-gray-600 mb-6">
                    Войдите через Telegram, чтобы увидеть свои записи
                </p>
                <div className="flex justify-center">
                    {process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME && (
                        <TelegramLoginButton
                            botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME}
                            onAuth={handleTelegramAuth}
                            buttonSize="large"
                            cornerRadius={8}
                        />
                    )}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => telegramUser && fetchBookings(telegramUser.id.toString())}
                    className="mt-4 text-primary-600 underline"
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 px-4">Мои записи</h2>

            {bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl mx-4">
                    <p className="text-gray-500 mb-4">У вас пока нет записей</p>
                    <a href="/booking" className="text-primary-600 font-semibold hover:underline">
                        Записаться на маникюр
                    </a>
                </div>
            ) : (
                <div className="px-4">
                    {bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} />
                    ))}
                </div>
            )}
        </div>
    );
}
