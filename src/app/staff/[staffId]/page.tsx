
'use client';

import React, { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, DocumentReference } from 'firebase/firestore';
import { StaffProfile } from '@/components/staff/staff-profile';
import { LoadingState } from '@/components/shared/loading-state';
import { StaffMember } from '@/types/staff';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';

/**
 * @fileOverview Client-side entry for staff profiles, fetching real-time personnel dossiers from Firestore.
 */
export default function Page({ params }: { params: Promise<{ staffId: string }> }) {
  const resolvedParams = React.use(params);
  const db = useFirestore();
  const router = useRouter();

  const userRef = useMemo(() => doc(db, 'users', resolvedParams.staffId) as DocumentReference<StaffMember>, [db, resolvedParams.staffId]);
  const { data: staff, loading } = useDoc<StaffMember>(userRef as any);

  if (loading) return <LoadingState />;

  if (!staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
        <div className="h-20 w-20 rounded-[2.5rem] bg-muted flex items-center justify-center border border-border/50 shadow-sm">
          <Users className="h-10 w-10 opacity-20" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tight">Personnel Record Not Located</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
            The requested personnel identification dossier could not be retrieved from the workshop registry.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/staff')} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-8 gap-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Force Strength
        </Button>
      </div>
    );
  }

  return <StaffProfile staff={staff} />;
}
