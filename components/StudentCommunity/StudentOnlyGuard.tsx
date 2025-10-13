// StudentCommunity/StudentOnlyGuard.tsx
'use client';
import { useAuth, userType } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== userType.STUDENT) {
      router.replace('/dashboard');
    }
    if (!isLoading && !user) {
      router.replace('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== userType.STUDENT) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  return <>{children}</>;
}
