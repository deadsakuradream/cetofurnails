import { getCurrentUser } from '@/lib/auth';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <AdminNav user={user} /> : null}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
