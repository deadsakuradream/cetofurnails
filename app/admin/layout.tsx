import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AdminNav from '@/components/AdminNav';
import { FolderIcon, SparklesIcon, SwatchIcon, PhotoIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

// Define navigation items here, as implied by the user's instruction and snippet
const navigation = [
  { name: 'Категории', href: '/admin/categories', icon: FolderIcon },
  { name: 'Услуги', href: '/admin/services', icon: SparklesIcon },
  { name: 'Дизайны', href: '/admin/designs', icon: SwatchIcon }, // SwatchIcon or similar
  { name: 'Портфолио', href: '/admin/portfolio', icon: PhotoIcon },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-next-url') || headersList.get('x-invoke-path') || '';
  const isLoginPage = pathname.includes('/admin/login');

  const user = await getCurrentUser();

  if (!user && !isLoginPage) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <AdminNav user={user} /> : null}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
