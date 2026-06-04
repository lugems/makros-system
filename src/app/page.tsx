
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

/**
 * @fileOverview System Entry Point & Traffic Orchestrator.
 * Routes authenticated users to their respective command centers and unauthenticated users to the terminal.
 * Hardened against hydration mismatches.
 */
export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    if (isAuthenticated) {
      if (user?.role === 'Customer') {
        router.push('/customer-portal');
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router, mounted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className={cn(
          "text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground",
          mounted && "animate-pulse"
        )}>
          Initializing Makros System...
        </p>
      </div>
    </div>
  );
}
