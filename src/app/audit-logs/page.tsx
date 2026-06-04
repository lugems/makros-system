'use client';

import React, { useMemo } from 'react';
import { AuditLogsPage } from '@/components/audit-logs/audit-logs-page';
import { useAuth } from '@/contexts/auth-context';
import { LoadingState } from '@/components/shared/loading-state';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Client-side entry for the immutable system audit registry.
 * Strictly gated to administrative personnel.
 */
export default function Page() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = useMemo(() => 
    ['Makros System Owner', 'Workshop Manager', 'Accountant'].includes(role || ''), 
    [role]
  );

  if (isLoading) return <LoadingState />;

  if (!isAuthorized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-lg shadow-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight">Clearance Restricted</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
                    The immutable system log is restricted to administrative personnel.
                </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Command
            </Button>
        </div>
    );
  }

  return <AuditLogsPage />;
}
