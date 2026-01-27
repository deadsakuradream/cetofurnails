import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
