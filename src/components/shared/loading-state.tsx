'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview A high-fidelity loading state component for the Midnight Slate UI.
 */
export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="absolute h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary/30 animate-pulse" />
      </div>
      <div className="mt-6 space-y-2 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Synchronizing Registry</p>
        <div className="flex gap-1 justify-center">
          <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}
