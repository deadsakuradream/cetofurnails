import MyBookingsList from '@/components/MyBookingsList';
import Navigation from '@/components/Navigation';

export default function MyBookingsPage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-32">
            <div className="max-w-md mx-auto pt-8">
                <MyBookingsList />
            </div>
            <Navigation />
        </main>
    );
}
