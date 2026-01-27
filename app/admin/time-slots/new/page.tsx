import TimeSlotForm from '@/components/TimeSlotForm';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function NewTimeSlotPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin/login');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Добавить временной слот</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <TimeSlotForm />
      </div>
    </div>
  );
}
