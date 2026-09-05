'use client';

import React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Query } from 'firebase/firestore';
import { CommunicationLog } from '@/types/communication';
import { LoadingState } from '@/components/shared/loading-state';
import { CommunicationCard } from './communication-card';
import { CommunicationsTable } from './communications-table';
import { CommunicationDetails } from './communication-details';
import { useMediaQuery } from '@/hooks/use-media-query';
import { MessageSquare, Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RelatedCommunicationsProps {
  assetId?: string;
  assetType?: string;
  customerId?: string;
  vehicleId?: string;
  jobCardId?: string;
  bookingId?: string;
  invoiceId?: string;
  className?: string;
  onLogInteraction?: () => void;
}

/**
 * @fileOverview Context-aware interaction ledger.
 * Filters the communication registry based on the provided dossier ID.
 */
export function RelatedCommunications({ 
  assetId,
  customerId, 
  vehicleId, 
  jobCardId, 
  bookingId, 
  invoiceId,
  className,
  onLogInteraction
}: RelatedCommunicationsProps) {
  const db = useFirestore();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // 1. Stabilized Contextual Query
  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    const baseRef = collection(db, 'communicationLogs');
    
    if (assetId) return query(baseRef, where('assetId', '==', assetId), orderBy('createdAt', 'desc'));
    if (customerId) return query(baseRef, where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
    if (vehicleId) return query(baseRef, where('vehicleId', '==', vehicleId), orderBy('createdAt', 'desc'));
    if (jobCardId) return query(baseRef, where('jobCardId', '==', jobCardId), orderBy('createdAt', 'desc'));
    if (bookingId) return query(baseRef, where('bookingId', '==', bookingId), orderBy('createdAt', 'desc'));
    if (invoiceId) return query(baseRef, where('invoiceId', '==', invoiceId), orderBy('createdAt', 'desc'));
    
    return query(baseRef, orderBy('createdAt', 'desc'));
  }, [db, assetId, customerId, vehicleId, jobCardId, bookingId, invoiceId]);

  const { data: logs, loading } = useCollection<CommunicationLog>(logsQuery as any);
  const [selectedLog, setSelectedLog] = React.useState<CommunicationLog | null>(null);

  if (loading) return <LoadingState />;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Trace Ledger</h4>
        </div>
        {onLogInteraction && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogInteraction}
            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-background border-border/50 hover:bg-primary hover:text-white transition-all rounded-xl"
          >
            <Plus className="h-3 w-3 mr-1.5" /> Initialize Trace
          </Button>
        )}
      </div>

      {logs && logs.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {isMobile ? (
            <div className="grid gap-4">
              {logs.map(log => (
                <CommunicationCard 
                  key={log.logId} 
                  log={log} 
                  onPreview={setSelectedLog} 
                  onEdit={() => {}} 
                />
              ))}
            </div>
          ) : (
            <CommunicationsTable 
              logs={logs} 
              onPreview={setSelectedLog} 
              onEdit={() => {}} 
            />
          )}
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed rounded-[2.5rem] opacity-30 flex flex-col items-center justify-center space-y-4 bg-muted/5">
          <Inbox className="h-10 w-10" />
          <p className="text-sm font-medium italic">No interaction traces registered for this dossier.</p>
        </div>
      )}

      <CommunicationDetails 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onOpenChange={(open) => !open && setSelectedLog(null)} 
      />
    </div>
  );
}
