import * as React from 'react';
import { format } from 'date-fns';
import { ClientOnly } from './client-only';

interface FormattedDateProps {
  date: any;
  formatString?: string;
  className?: string;
}

/**
 * @fileOverview A safe date formatting component that handles strings, Dates, and Firestore Timestamps.
 * Robustly handles pending server timestamps and various object formats.
 */
export function FormattedDate({ date, formatString = 'PPP p', className }: FormattedDateProps) {
  if (!date) return <span className={className}>N/A</span>;
  
  let dateObj: Date | null = null;
  
  // Handle Firestore Timestamp or similar object
  if (date && typeof date === 'object') {
    if ('seconds' in date) {
      dateObj = new Date(date.seconds * 1000);
    } else if (typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    }
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  }
  
  if (!dateObj || isNaN(dateObj.getTime())) {
    // Check if it's a pending server timestamp object which often has no seconds yet
    if (typeof date === 'object') {
        return <span className={cn("text-muted-foreground italic", className)}>Pending Sync</span>;
    }
    return <span className={className}>Invalid Date</span>;
  }

  return (
    <ClientOnly fallback={<span className="animate-pulse bg-muted rounded h-4 w-24 inline-block" />}>
      <span className={className}>{format(dateObj, formatString)}</span>
    </ClientOnly>
  );
}

function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
