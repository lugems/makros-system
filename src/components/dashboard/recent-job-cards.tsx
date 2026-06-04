'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { Wrench, ChevronRight, Fingerprint, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JobCard } from '@/types/job-card';
import useMakrosStore from '@/store/makros-store';
import { JobStatusBadge } from '../job-cards/job-status-badge';

interface RecentJobCardsProps {
  jobCards: JobCard[];
}

export const RecentJobCards: React.FC<RecentJobCardsProps> = ({ jobCards }) => {
  const router = useRouter();
  const { customers } = useMakrosStore();

  return (
    <div className="divide-y divide-border/40">
      {jobCards.length > 0 ? jobCards.map((job) => {
        const customer = customers.find(c => c.customerId === job.customerId);
        
        return (
          <div 
            key={job.jobCardId} 
            className="flex items-center justify-between p-5 hover:bg-muted/10 transition-colors group cursor-pointer"
            onClick={() => router.push(`/job-cards/${job.jobCardId}`)}
          >
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 group-hover:scale-110 transition-transform">
                <Wrench className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                    {customer?.fullName || 'Registry Void'}
                  </p>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted border border-border/50">
                    <Fingerprint className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">{job.jobCardId.slice(-6)}</span>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest line-clamp-1 max-w-[150px]">
                    {job.reportedIssue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <JobStatusBadge status={job.status} className="text-[8px] px-2 py-0.5" />
              <ChevronRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>
          </div>
        );
      }) : (
        <div className="p-10 text-center opacity-30">
          <ClipboardList className="h-8 w-8 mx-auto mb-2" />
          <p className="text-[9px] font-black uppercase tracking-widest">No Active Bay Load</p>
        </div>
      )}
      <div className="p-4 bg-muted/5 text-center">
        <button 
            onClick={() => router.push('/job-cards')}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          Manage Workshop Load
        </button>
      </div>
    </div>
  );
};