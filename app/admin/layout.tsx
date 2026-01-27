import { getCurrentUser } from '@/lib/auth';
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
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? <AdminNav user={user} /> : null}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
