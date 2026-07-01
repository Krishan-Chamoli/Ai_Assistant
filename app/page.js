'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-context';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <img 
          src="/logo.png"
          alt="Nebuloid Logo"
          className="h-16 w-16 rounded-xl object-contain animate-pulse-subtle"
        />
        <div className="space-y-1.5 mt-2">
          <h2 className="text-lg font-bold">Nebuloid Tech Studio</h2>
          <p className="text-sm text-muted-foreground animate-pulse-subtle">Initializing AI Content Assistant...</p>
        </div>
      </div>
    </div>
  );
}
